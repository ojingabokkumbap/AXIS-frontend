import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/i18n';
import { aiProctorApi } from '@/services/api';

// Cap the voice-clip rolling buffer at 5 chunks. With rec.start(1_000) timeslice
// this keeps the most recent ≤5s of video+audio so VOICE_DETECTED ships a
// short, reviewable clip instead of growing unbounded since the last event.
const MAX_CLIP_CHUNKS = 5;

export type MicStatus =
  | 'PENDING'
  | 'CALIBRATING'
  | 'LISTENING'
  | 'VOICE_DETECTED'
  | 'DISCONNECTED'
  | 'ERROR';

export type MicDisconnectReason = 'ENDED' | 'MUTED' | 'STOPPED' | 'NO_TRACK';

export interface MicState {
  status: MicStatus;
  baselineRms: number | null;
  currentRms: number;
  warnings: number;
  lastEventAt: number | null;
  /**
   * Set the moment we observe the audio track is no longer delivering data.
   * The hook keeps a `MUTE_GRACE_MS` grace window (default 5s) before
   * promoting `DISCONNECTED` so a transient Bluetooth glitch doesn't
   * terminate honest candidates. `track.ended` short-circuits the grace
   * window since the device is definitively gone.
   */
  disconnectedReason: MicDisconnectReason | null;
}

export interface ProctorMicEvent {
  type: 'VOICE_DETECTED' | 'MIC_DISCONNECTED';
  /** RMS of the offending sample (only meaningful for VOICE_DETECTED). */
  rms: number;
  durationMs: number;
  /**
   * Calibration baseline at the time of the event (only meaningful for
   * VOICE_DETECTED — for MIC_DISCONNECTED this is the last known baseline
   * or 0 if disconnect happened before calibration finished).
   */
  baselineRms: number;
  ts: number;
  sessionId?: string;
  /** Disconnect reason — only set when type === 'MIC_DISCONNECTED'. */
  reason?: MicDisconnectReason;
}

interface Options {
  enabled: boolean;
  sessionId?: string;
  thresholdMultiplier?: number; // default 2.5×
  windowMs?: number;            // default 200 ms
  sustainMs?: number;           // default 500 ms
  baselineMs?: number;          // default 2500 ms
  /**
   * VAD-style hangover. After RMS dips below the trigger threshold, we keep
   * treating the signal as "still active" for this many ms so natural word
   * gaps (typically 100-200 ms) don't reset the sustain accumulator. Default
   * 400 ms, which lets a spoken sentence cleanly accumulate the sustain
   * window even with breath pauses between words.
   */
  hangoverMs?: number;
  onEvent?: (e: ProctorMicEvent) => void;
  /**
   * Live MediaStream from the proctor camera. When provided, the monitor
   * attaches a rolling-5s MediaRecorder to it (recording **video+audio**)
   * and ships the finalized webm + a still frame on every VOICE_DETECTED.
   * If null, voice events still fire but no clip is uploaded.
   */
  videoStream?: MediaStream | null;
  /**
   * When true, voice-clip uploads route to the demo evidence endpoint
   * (aiProctorApi.demoVoiceClip) instead of aiProctorApi.voiceClip, and
   * sessionId is ignored. Used by DemoPage so demo runs persist evidence
   * the same way real exams do.
   */
  demoMode?: boolean;
}

/**
 * Always-on microphone silence monitor.
 *
 *   getUserMedia({ audio:true }) → AudioContext → AnalyserNode
 *   • 5-second baseline calibration of room noise floor
 *   • RMS sampled every windowMs over the time-domain buffer
 *   • voiceRms > baseline × thresholdMultiplier sustained for sustainMs
 *     ⇒ emits VOICE_DETECTED on `window` ('proctor:event' CustomEvent)
 *     and increments state.warnings
 *
 * Pair with <MicBanner state={...} /> for the warning UI.
 */
export function useMicMonitor(opts: Options): {
  state: MicState;
  start: () => Promise<void>;
  stop: () => void;
} {
  const {
    enabled,
    sessionId,
    // Tuned for proctoring sensitivity:
    //   • 2.5× over baseline catches normal speaking voice without flagging
    //     keyboard taps or HVAC.
    //   • 500 ms sustain still skips coughs / chair creaks but fires on a
    //     spoken sentence almost immediately. Combined with `hangoverMs` this
    //     reliably catches reading aloud without false-positive on isolated
    //     bursts.
    //   • 2.5 s baseline gets us to LISTENING quickly so the user sees the
    //     mic banner clear and knows monitoring is live. Baseline is *capped*
    //     downstream (see sample()) so a contaminated calibration window can
    //     never push the trigger threshold out of reach of normal speech.
    //   • 400 ms hangover bridges natural word gaps so a sentence read aloud
    //     accumulates sustain instead of being reset by every breath pause.
    thresholdMultiplier = 2.5,
    windowMs = 200,
    sustainMs = 500,
    baselineMs = 2500,
    hangoverMs = 400,
    onEvent,
    videoStream,
    demoMode = false,
  } = opts;
  const videoStreamRef = useRef<MediaStream | null>(null);
  videoStreamRef.current = videoStream ?? null;

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const tickRef = useRef<number | null>(null);
  const dataBufRef = useRef<Float32Array<ArrayBuffer> | null>(null);
  // Rolling-5s recorder: keeps the most recent MAX_CLIP_CHUNKS chunks in
  // `recorderChunksRef` (trimmed in the `ondataavailable` handler) and rotates
  // the recorder whenever a VOICE event fires so the previous ≤5s window can
  // be finalized + uploaded.
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recorderChunksRef = useRef<Blob[]>([]);
  const recorderStartedAtRef = useRef<number>(0);
  const recorderMimeRef = useRef<string>('video/webm');

  const baselineSamplesRef = useRef<number[]>([]);
  const baselineDoneRef = useRef(false);
  const baselineRmsRef = useRef<number | null>(null);
  const sustainStartRef = useRef<number | null>(null);
  // Last tick where rms was above threshold. Used by the VAD-style hangover
  // so brief inter-word dips don't reset the sustain accumulator.
  const lastAboveRef = useRef<number | null>(null);
  // armed=false after firing; re-arms once RMS drops back below threshold
  const armedRef = useRef(true);
  // ── Disconnect detection ──────────────────────────────────────────────
  // First moment we noticed the audio track stopped delivering data
  // (track.muted=true OR track.readyState !== 'live'). We wait MUTE_GRACE_MS
  // before promoting it to a hard MIC_DISCONNECTED so a flaky Bluetooth
  // headset doesn't terminate honest candidates. `track.ended` short-circuits
  // the grace window — once a track emits 'ended' the device is definitively
  // gone and there's no recovery without a fresh getUserMedia().
  const muteSinceRef = useRef<number | null>(null);
  // Latch — a single MIC_DISCONNECTED report is enough; further callbacks
  // are suppressed so the consumer isn't spammed during the few seconds
  // between disconnect and unmount.
  const disconnectedFiredRef = useRef(false);

  const [state, setState] = useState<MicState>({
    status: 'PENDING',
    baselineRms: null,
    currentRms: 0,
    warnings: 0,
    lastEventAt: null,
    disconnectedReason: null,
  });

  const stop = () => {
    if (tickRef.current != null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    try { sourceRef.current?.disconnect(); } catch { /* ignore */ }
    try { analyserRef.current?.disconnect(); } catch { /* ignore */ }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => { /* ignore */ });
    }
    if (recorderRef.current) {
      try {
        if (recorderRef.current.state !== 'inactive') recorderRef.current.stop();
      } catch { /* ignore */ }
      recorderRef.current = null;
    }
    recorderChunksRef.current = [];
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    dataBufRef.current = null;
    baselineSamplesRef.current = [];
    baselineDoneRef.current = false;
    baselineRmsRef.current = null;
    sustainStartRef.current = null;
    lastAboveRef.current = null;
    armedRef.current = true;
    muteSinceRef.current = null;
    disconnectedFiredRef.current = false;
  };

  /**
   * Pick a supported mimeType. `video/webm;codecs=vp9,opus` is the brief's
   * preferred choice — fall back through descending ladders so older Safari /
   * Firefox don't reject the recorder.
   */
  const pickMimeType = (): string | undefined => {
    if (typeof MediaRecorder === 'undefined') return undefined;
    const candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'audio/webm;codecs=opus',
      'audio/webm',
    ];
    for (const m of candidates) {
      if (MediaRecorder.isTypeSupported(m)) return m;
    }
    return undefined;
  };

  /** Capture a single still JPEG from the live camera stream. */
  const captureStillJpeg = async (): Promise<Blob | null> => {
    const v = videoStreamRef.current;
    if (!v) return null;
    const track = v.getVideoTracks()[0];
    if (!track) return null;
    try {
      // ImageCapture is the cleanest path; fallback to drawing a hidden
      // <video> if the browser hasn't shipped it (Safari < 17.5).
      const W = window as unknown as {
        ImageCapture?: new (track: MediaStreamTrack) => {
          grabFrame: () => Promise<ImageBitmap>;
        };
      };
      if (W.ImageCapture) {
        const ic = new W.ImageCapture(track);
        const bitmap = await ic.grabFrame();
        const c =
          typeof OffscreenCanvas !== 'undefined'
            ? new OffscreenCanvas(bitmap.width, bitmap.height)
            : Object.assign(document.createElement('canvas'), {
                width: bitmap.width,
                height: bitmap.height,
              });
        const ctx = (c as OffscreenCanvas | HTMLCanvasElement).getContext('2d');
        if (!ctx) return null;
        (ctx as CanvasRenderingContext2D).drawImage(bitmap as unknown as CanvasImageSource, 0, 0);
        if ('convertToBlob' in c) {
          return await (c as OffscreenCanvas).convertToBlob({
            type: 'image/jpeg',
            quality: 0.7,
          });
        }
        return await new Promise<Blob | null>((resolve) =>
          (c as HTMLCanvasElement).toBlob((b) => resolve(b), 'image/jpeg', 0.7),
        );
      }
    } catch {
      /* fall through */
    }
    return null;
  };

  const startRecorder = (composite: MediaStream) => {
    if (typeof MediaRecorder === 'undefined') return;
    try {
      const mime = pickMimeType();
      const opts: MediaRecorderOptions = mime ? { mimeType: mime } : {};
      const rec = new MediaRecorder(composite, opts);
      recorderMimeRef.current = mime ?? rec.mimeType ?? 'video/webm';
      recorderChunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recorderChunksRef.current.push(e.data);
          // True rolling-5s window: with a 1s timeslice we keep the most
          // recent 5 chunks so flushAndRotateRecorder ships a ≤5s clip
          // regardless of how long the recorder has been running.
          while (recorderChunksRef.current.length > MAX_CLIP_CHUNKS) {
            recorderChunksRef.current.shift();
          }
        }
      };
      // Slice every second so the rolling buffer is meaningful — without
      // `timeslice` chunks only land on stop().
      rec.start(1_000);
      recorderRef.current = rec;
      recorderStartedAtRef.current = Date.now();
    } catch {
      recorderRef.current = null;
    }
  };

  /**
   * On VOICE: finalize the current recorder, ship the chunks + a still frame,
   * and start a fresh recorder so the next event has its own 10s window.
   *
   * IMPORTANT — chunk ownership:
   *   `recorderChunksRef` is the live buffer the OLD recorder has been
   *   pushing into via its `ondataavailable` handler. We have to snapshot it
   *   *synchronously* before calling `startRecorder(composite)` below,
   *   because that call resets `recorderChunksRef.current = []` for the
   *   NEW recorder. Without the snapshot the rolling buffer (i.e. the
   *   actual proof clip) gets wiped before the old recorder's async
   *   `stop` event fires, leaving us with either a null blob (no upload)
   *   or a single sub-second tail fragment (unusable evidence). We also
   *   hijack the old recorder's `ondataavailable` so its final flush
   *   (which fires between `stop()` and the `stop` event) lands in a
   *   local `finalChunks` array instead of the new recorder's shared
   *   buffer.
   */
  const flushAndRotateRecorder = async (
    rms: number,
    durationMs: number,
    baselineRms: number,
    ts: number,
  ): Promise<void> => {
    const composite = videoStreamRef.current;
    const old = recorderRef.current;
    recorderRef.current = null;
    if (!old) {
      if (composite) startRecorder(composite);
      return;
    }
    // Snapshot the buffer + mime under the OLD recorder's identity. After
    // this point we're free to rotate to a new recorder without losing the
    // proof clip.
    const oldMime = recorderMimeRef.current;
    const rollingChunks = recorderChunksRef.current.slice();
    const finalChunks: Blob[] = [];
    old.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) finalChunks.push(e.data);
    };
    const finalized = new Promise<Blob | null>((resolve) => {
      let done = false;
      const onStop = () => {
        if (done) return;
        done = true;
        const all = [...rollingChunks, ...finalChunks];
        if (all.length === 0) {
          resolve(null);
          return;
        }
        resolve(new Blob(all, { type: oldMime }));
      };
      old.addEventListener('stop', onStop, { once: true });
      // Safety timeout in case `stop` never fires (some browsers swallow it
      // when the underlying track ends mid-recording).
      window.setTimeout(onStop, 1_500);
    });
    try {
      if (old.state !== 'inactive') old.stop();
    } catch { /* ignore */ }

    // Start the next window immediately so we don't lose audio coverage.
    // Safe to call now that `rollingChunks` already captured the old
    // recorder's data — startRecorder() will reset the shared buffer for
    // the new recorder.
    if (composite) startRecorder(composite);

    const clip = await finalized;
    // Demo mode uploads to the demo endpoint (no sessionId required); real
    // exams require sessionId and route to the session-scoped endpoint.
    if (!clip || (!demoMode && !sessionId)) {
      const peakDb = rmsToDb(rms);
      try { void peakDb; } catch { /* ignore */ }
      return;
    }
    const still = await captureStillJpeg();
    try {
      if (demoMode) {
        await aiProctorApi.demoVoiceClip(ts, clip, still, {
          peakDb: rmsToDb(rms),
          durationMs,
        });
      } else if (sessionId) {
        await aiProctorApi.voiceClip(sessionId, ts, clip, still, {
          peakDb: rmsToDb(rms),
          durationMs,
        });
      }
    } catch {
      // Per the brief: any AI failure degrades silently. Voice was still logged
      // via the existing 'proctor:event' CustomEvent path.
    }
    void baselineRms;
  };

  /**
   * Hard-violation: the candidate's mic is no longer delivering audio. We
   * latch on the first emission so a flaky device that re-fires every poll
   * doesn't spam the consumer with duplicate termination requests. The
   * caller is responsible for actually terminating the session — this hook
   * just reports the fact.
   */
  const emitMicDisconnect = (reason: MicDisconnectReason) => {
    if (disconnectedFiredRef.current) return;
    disconnectedFiredRef.current = true;
    const now = Date.now();
    const baseline = baselineRmsRef.current ?? 0;
    const evt: ProctorMicEvent = {
      type: 'MIC_DISCONNECTED',
      rms: 0,
      durationMs: muteSinceRef.current != null ? Math.max(0, now - muteSinceRef.current) : 0,
      baselineRms: baseline,
      ts: now,
      sessionId,
      reason,
    };
    try { onEvent?.(evt); } catch { /* ignore */ }
    try {
      window.dispatchEvent(new CustomEvent('proctor:event', { detail: evt }));
    } catch { /* ignore */ }
    setState((p) => ({
      ...p,
      status: 'DISCONNECTED',
      disconnectedReason: reason,
      lastEventAt: now,
    }));
  };

  /**
   * Wire the lifecycle listeners on the audio track so we react instantly
   * to a hot-unplugged USB mic / closed Bluetooth pairing. `track.ended`
   * is the canonical signal — once it fires the device cannot recover
   * without a fresh getUserMedia(), so we report immediately. `mute` /
   * `unmute` are softer signals (the OS may briefly mute the line during a
   * sample-rate switch); we start a grace window in `sample()` based on
   * `track.muted` and only escalate after MUTE_GRACE_MS.
   */
  const wireTrackListeners = (track: MediaStreamTrack) => {
    track.addEventListener('ended', () => {
      emitMicDisconnect('ENDED');
    });
    track.addEventListener('mute', () => {
      // Start the grace window — sample() will promote to DISCONNECTED if
      // the mute persists past MUTE_GRACE_MS.
      if (muteSinceRef.current == null) muteSinceRef.current = Date.now();
    });
    track.addEventListener('unmute', () => {
      // Recovered — reset the grace window so a future short blip starts
      // a fresh countdown.
      muteSinceRef.current = null;
    });
  };

  const start = async () => {
    if (streamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;

      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) {
        // Mic granted but no usable track — treat as disconnected so the
        // caller can terminate rather than hanging in CALIBRATING forever.
        setState((p) => ({ ...p, status: 'ERROR' }));
        emitMicDisconnect('NO_TRACK');
        return;
      }
      wireTrackListeners(audioTrack);
      // If the device returns a track that's already muted/ended (rare —
      // happens when a Bluetooth mic disconnects between permission grant
      // and stream creation), report immediately.
      if (audioTrack.readyState === 'ended') {
        emitMicDisconnect('ENDED');
        return;
      }
      if (audioTrack.muted) {
        muteSinceRef.current = Date.now();
      }

      const Ctx: typeof AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') {
        try { await ctx.resume(); } catch { /* ignore */ }
      }

      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0;
      source.connect(analyser);
      analyserRef.current = analyser;
      dataBufRef.current = new Float32Array(new ArrayBuffer(analyser.fftSize * 4));

      setState((p) => ({ ...p, status: 'CALIBRATING' }));
      tickRef.current = window.setInterval(sample, windowMs);
    } catch {
      setState((p) => ({ ...p, status: 'ERROR' }));
    }
  };

  /**
   * Grace window for a soft-mute (track.muted=true OR readyState!='live')
   * before we treat the mic as disconnected. 5s is conservative — long
   * enough for a Bluetooth sample-rate switch (~1-2s on macOS) and brief
   * USB re-enumeration, short enough that a candidate can't disable the
   * mic mid-cheating without our pipeline noticing.
   */
  const MUTE_GRACE_MS = 5_000;

  /**
   * Per-tick disconnect health check. Returns true if we already fired (so
   * the caller can short-circuit further analysis on this tick). Never
   * fires until calibration completed — during the first 2.5s the device
   * is often still warming up and can briefly read as muted.
   */
  const checkDisconnect = (): boolean => {
    if (disconnectedFiredRef.current) return true;
    const stream = streamRef.current;
    if (!stream) return false;
    const track = stream.getAudioTracks()[0];

    // Hard signals — report immediately, no grace.
    if (!track) {
      emitMicDisconnect('NO_TRACK');
      return true;
    }
    if (track.readyState === 'ended' || !stream.active) {
      emitMicDisconnect('ENDED');
      return true;
    }

    // Soft signal: track.muted persists beyond the grace window. We don't
    // start the grace clock until calibration finishes so the very first
    // few hundred ms of warm-up don't immediately count.
    if (track.muted) {
      if (!baselineDoneRef.current) return false;
      if (muteSinceRef.current == null) muteSinceRef.current = Date.now();
      if (Date.now() - muteSinceRef.current >= MUTE_GRACE_MS) {
        emitMicDisconnect('MUTED');
        return true;
      }
    } else if (muteSinceRef.current != null) {
      muteSinceRef.current = null;
    }
    return false;
  };

  const sample = () => {
    // Always run the disconnect health check first — if the track is gone
    // there's nothing meaningful to read into the analyser.
    if (checkDisconnect()) return;
    const analyser = analyserRef.current;
    const buf = dataBufRef.current;
    if (!analyser || !buf) return;
    analyser.getFloatTimeDomainData(buf);

    let sumSq = 0;
    for (let i = 0; i < buf.length; i++) sumSq += buf[i] * buf[i];
    const rms = Math.sqrt(sumSq / buf.length);

    if (!baselineDoneRef.current) {
      baselineSamplesRef.current.push(rms);
      const needed = Math.max(1, Math.round(baselineMs / windowMs));
      if (baselineSamplesRef.current.length >= needed) {
        const avg =
          baselineSamplesRef.current.reduce((a, b) => a + b, 0) /
          baselineSamplesRef.current.length;
        // Floor so a perfectly silent room (~0 RMS) doesn't trigger on every
        // breath; *cap* so a contaminated calibration window (the user was
        // talking, the room was loud, the consent screen was being read aloud)
        // can't push the trigger threshold (baseline × multiplier) above the
        // RMS of normal speech. Empirically, sustained reading aloud at desk
        // distance lands around 0.03-0.10 RMS, so capping baseline at 0.012
        // keeps the trigger ≤ 0.030 — well within any audible voice.
        const BASELINE_FLOOR = 0.003;
        const BASELINE_CEIL = 0.012;
        const baseline = Math.min(
          Math.max(avg, BASELINE_FLOOR),
          BASELINE_CEIL,
        );
        baselineRmsRef.current = baseline;
        baselineDoneRef.current = true;
        setState((p) => ({
          ...p,
          status: 'LISTENING',
          baselineRms: baseline,
          currentRms: rms,
        }));
      } else {
        setState((p) => ({ ...p, currentRms: rms }));
      }
      return;
    }

    const baseline = baselineRmsRef.current ?? 0.005;
    const threshold = baseline * thresholdMultiplier;
    const now = Date.now();

    // VAD-style hangover: keep treating the signal as active while we're
    // within `hangoverMs` of the last above-threshold tick, so natural word
    // gaps in a sentence don't reset the sustain counter.
    if (rms > threshold) {
      lastAboveRef.current = now;
    }
    const inHangover =
      lastAboveRef.current != null && now - lastAboveRef.current < hangoverMs;
    const isActive = rms > threshold || inHangover;

    if (isActive) {
      if (sustainStartRef.current == null) sustainStartRef.current = now;
      const dur = now - sustainStartRef.current;
      if (dur >= sustainMs && armedRef.current) {
        armedRef.current = false;
        const evt: ProctorMicEvent = {
          type: 'VOICE_DETECTED',
          rms,
          durationMs: dur,
          baselineRms: baseline,
          ts: now,
          sessionId,
        };
        try { onEvent?.(evt); } catch { /* ignore */ }
        try {
          window.dispatchEvent(new CustomEvent('proctor:event', { detail: evt }));
        } catch { /* ignore */ }
        // Finalize the rolling 10s recording + ship to /voice-clip. Fire-and-
        // forget — flushAndRotateRecorder swallows its own errors.
        void flushAndRotateRecorder(rms, dur, baseline, now);
        setState((p) => ({
          ...p,
          status: 'VOICE_DETECTED',
          currentRms: rms,
          warnings: p.warnings + 1,
          lastEventAt: now,
        }));
        return;
      }
    } else {
      sustainStartRef.current = null;
      // RMS+hangover dropped below threshold — re-arm so the next sustained
      // burst can fire on its own.
      if (!armedRef.current) armedRef.current = true;
    }

    setState((p) => {
      const display: MicStatus =
        p.status === 'VOICE_DETECTED' && p.lastEventAt && now - p.lastEventAt < 2000
          ? 'VOICE_DETECTED'
          : 'LISTENING';
      return { ...p, status: display, currentRms: rms };
    });
  };

  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }
    start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, sessionId]);

  // (Re)start the rolling MediaRecorder whenever the upstream video stream
  // becomes available or rotates — share the same MediaStream the proctor
  // camera holds so we never call getUserMedia({ video }) a second time.
  useEffect(() => {
    if (!enabled) return;
    if (!videoStream) return;
    // Only start once we have at least one video track + one audio track. The
    // proctor camera stream is video-only; we attach the mic audio track from
    // the audio-only stream the analyser is running on.
    const audioStream = streamRef.current;
    if (!audioStream) return;
    const composite = new MediaStream();
    for (const t of videoStream.getVideoTracks()) composite.addTrack(t);
    for (const t of audioStream.getAudioTracks()) composite.addTrack(t);
    if (composite.getVideoTracks().length === 0 || composite.getAudioTracks().length === 0) {
      return;
    }
    if (recorderRef.current) {
      try {
        if (recorderRef.current.state !== 'inactive') recorderRef.current.stop();
      } catch { /* ignore */ }
      recorderRef.current = null;
      recorderChunksRef.current = [];
    }
    startRecorder(composite);
    return () => {
      if (recorderRef.current) {
        try {
          if (recorderRef.current.state !== 'inactive') recorderRef.current.stop();
        } catch { /* ignore */ }
        recorderRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, videoStream, sessionId]);

  return { state, start, stop };
}

function rmsToDb(rms: number): number {
  if (rms <= 0) return -200;
  const db = 20 * Math.log10(rms);
  return db < -200 ? -200 : db > 0 ? 0 : db;
}

export function MicBanner({
  state,
  strikes,
  limit,
  /**
   * When true (default), the banner is always rendered: a calm green strip
   * during normal LISTENING that shows live RMS vs. the trigger threshold so
   * the candidate (and proctor) can see at a glance that the mic is alive
   * and roughly how loud the room is. Set to false to fall back to the
   * legacy "only show on warning/error" behavior used elsewhere.
   */
  alwaysVisible = true,
}: {
  state: MicState;
  /**
   * Optional running strike count from the host page (e.g. ExamRunnerPage).
   * When supplied alongside `limit`, the banner shows "Strike N/limit" and
   * turns red on the final warning so the candidate sees the consequence
   * before the next event terminates the exam.
   */
  strikes?: number;
  limit?: number;
  alwaysVisible?: boolean;
}) {
  const { t } = useI18n();
  const showStrikes =
    typeof strikes === 'number' && typeof limit === 'number' && strikes > 0;
  const isFinalWarning =
    showStrikes && (strikes as number) >= (limit as number) - 1;

  if (state.status === 'PENDING') {
    if (!alwaysVisible) return null;
    return (
      <div
        className="bg-slate-700 text-white text-xs px-4 py-1.5 flex items-center gap-3 font-medium"
        role="status"
      >
        <span className="font-bold uppercase">{t('mic.label')}</span>
        <span className="flex-1 opacity-90">
          Initializing microphone…
        </span>
      </div>
    );
  }
  if (state.status === 'CALIBRATING') {
    if (!alwaysVisible) return null;
    return (
      <div
        className="bg-blue-700 text-white text-xs px-4 py-1.5 flex items-center gap-3 font-medium"
        role="status"
      >
        <span className="font-bold uppercase">{t('mic.label')}</span>
        <span className="flex-1 opacity-90">
          Calibrating room noise — please remain silent for ~2 seconds.
        </span>
        <span className="opacity-80 font-mono">
          rms={state.currentRms.toFixed(3)}
        </span>
      </div>
    );
  }
  if (state.status === 'LISTENING') {
    if (!alwaysVisible) return null;
    // Quiet "all clear" strip with a live RMS meter so the candidate can see
    // proof that the mic is registering audio. Showing this continuously is
    // the most reliable way to tell apart "broken mic" from "mic is fine,
    // you're just not loud enough yet."
    const baseline = state.baselineRms ?? 0;
    const triggerAt = baseline * 2.5; // matches default thresholdMultiplier
    const meterPct = Math.min(
      100,
      Math.round((state.currentRms / Math.max(triggerAt, 0.0001)) * 100),
    );
    const tone =
      isFinalWarning
        ? 'bg-red-700'
        : showStrikes
        ? 'bg-amber-700'
        : 'bg-emerald-800';
    return (
      <div
        className={`${tone} text-white text-[11px] px-4 py-1 flex items-center gap-3 font-medium`}
        role="status"
      >
        <span className="font-bold uppercase tracking-wide">
          {t('mic.label')}
        </span>
        <span className="opacity-90">Listening</span>
        <div
          className="flex-1 h-1.5 bg-black/30 rounded-full overflow-hidden max-w-[280px]"
          aria-hidden
          title={`RMS ${state.currentRms.toFixed(3)} of trigger ${triggerAt.toFixed(3)}`}
        >
          <div
            className={`h-full ${
              meterPct >= 100
                ? 'bg-red-400'
                : meterPct >= 70
                ? 'bg-amber-300'
                : 'bg-emerald-400'
            } transition-[width] duration-100`}
            style={{ width: `${meterPct}%` }}
          />
        </div>
        {showStrikes && (
          <span className="font-bold font-mono uppercase tracking-wide">
            Strike {strikes}/{limit}
          </span>
        )}
        <span className="opacity-70 font-mono">
          rms={state.currentRms.toFixed(3)} · trig={triggerAt.toFixed(3)} ·
          warns={state.warnings}
        </span>
      </div>
    );
  }

  // DISCONNECTED is a hard violation — render the loudest possible banner
  // (red, fixed, full-width emphasis) so the candidate sees why the exam is
  // about to end. The host page is responsible for actually triggering the
  // server termination + result-page navigation; we just paint the alert.
  if (state.status === 'DISCONNECTED') {
    return (
      <div
        className="bg-red-700 text-white text-sm px-4 py-2 flex items-center gap-3 font-bold"
        role="alert"
      >
        <span className="font-extrabold uppercase tracking-wide">
          {t('mic.label')}
        </span>
        <span className="flex-1">{t('mic.disconnected')}</span>
        <span className="opacity-80 text-xs">
          {(() => { const key = `mic.reason.${state.disconnectedReason ?? 'ENDED'}`; const tr = t(key as never); return tr === key ? (state.disconnectedReason ?? 'ENDED') : tr; })()}
        </span>
      </div>
    );
  }

  // VOICE_DETECTED or ERROR
  const tone =
    state.status === 'ERROR'
      ? 'bg-red-600'
      : isFinalWarning
      ? 'bg-red-700'
      : 'bg-amber-600';
  const message = state.status === 'ERROR' ? t('mic.error') : t('mic.voice');
  return (
    <div
      className={`${tone} text-white text-xs px-4 py-1.5 flex items-center gap-3 font-medium`}
      role="alert"
    >
      <span className="font-bold uppercase">{t('mic.label')}</span>
      <span className="flex-1">{message}</span>
      {showStrikes && (
        <span className="font-bold font-mono uppercase tracking-wide">
          Strike {strikes}/{limit}
        </span>
      )}
      <span className="opacity-80 font-mono">
        rms={state.currentRms.toFixed(3)} · base=
        {(state.baselineRms ?? 0).toFixed(3)} · warns={state.warnings}
      </span>
    </div>
  );
}
