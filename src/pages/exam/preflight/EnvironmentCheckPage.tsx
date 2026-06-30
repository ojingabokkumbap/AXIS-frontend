import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Mic,
  Monitor,
  Globe,
  Wifi,
  Check,
  AlertTriangle,
  X,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useI18n } from '@/i18n';
import { CbtShell } from '@/components/cbt/CbtShell';

type CheckStatus = 'pending' | 'running' | 'pass' | 'warn' | 'fail';

interface CheckItem {
  key: 'device' | 'browser' | 'camera' | 'mic' | 'network';
  status: CheckStatus;
  detail: string;
  hint?: string;
}

interface BrowserInfo {
  name: string;
  version: number;
  ok: boolean;
}

function detectBrowser(ua: string): BrowserInfo {
  // Order matters: check Edge before Chrome (Edge UA includes "Chrome").
  const edge = ua.match(/Edg\/(\d+)/);
  if (edge) return { name: 'Edge', version: Number(edge[1]), ok: Number(edge[1]) >= 90 };
  const chrome = ua.match(/Chrome\/(\d+)/);
  if (chrome) return { name: 'Chrome', version: Number(chrome[1]), ok: Number(chrome[1]) >= 90 };
  const firefox = ua.match(/Firefox\/(\d+)/);
  if (firefox) return { name: 'Firefox', version: Number(firefox[1]), ok: Number(firefox[1]) >= 88 };
  const safari = ua.match(/Version\/(\d+).*Safari/);
  if (safari) return { name: 'Safari', version: Number(safari[1]), ok: Number(safari[1]) >= 14 };
  return { name: 'Unknown', version: 0, ok: false };
}

function isMobileUA(ua: string): boolean {
  return /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(ua);
}

/**
 * Ambient noise gating thresholds (peak RMS over a short calibration window).
 * Tuned against the silence floor used by useMicMonitor (~0.005 in a quiet
 * room). The mic monitor's voice-burst detector triggers at baseline × 2.5,
 * so a sustained baseline above ~0.04 means the room itself is loud enough
 * that real voice events would no longer fire reliably — we refuse to seat
 * the candidate in that environment.
 */
const NOISE_FAIL_THRESHOLD = 0.04;
/** Borderline noisy — passes the check but warns the candidate. */
const NOISE_WARN_THRESHOLD = 0.018;
/** Length of the silent calibration window during the mic check. */
const NOISE_SAMPLE_MS = 3_000;

function statusPillCls(status: CheckStatus): string {
  const map: Record<CheckStatus, string> = {
    pending: 'bg-white/[0.05] text-white/55',
    running: 'bg-cyan-500/15 text-cyan-300',
    pass: 'bg-emerald-500/15 text-emerald-300',
    warn: 'bg-amber-500/15 text-amber-300',
    fail: 'bg-red-500/15 text-red-300',
  };
  return map[status];
}

const STATUS_KEY: Record<CheckStatus, string> = {
  pending: 'ready.check.status.waiting',
  running: 'ready.check.status.checking',
  pass: 'ready.check.status.pass',
  warn: 'ready.check.status.warn',
  fail: 'ready.check.status.fail',
};

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === 'running') return <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />;
  if (status === 'pass') return <Check className="w-4 h-4 text-emerald-400" />;
  if (status === 'warn') return <AlertTriangle className="w-4 h-4 text-amber-300" />;
  if (status === 'fail') return <X className="w-4 h-4 text-red-300" />;
  return <span className="w-4 h-4 rounded-full border-[1.5px] border-white/15 inline-block" />;
}

const ICONS: Record<CheckItem['key'], typeof Camera> = {
  device: Monitor,
  browser: Globe,
  camera: Camera,
  mic: Mic,
  network: Wifi,
};

const TITLE_KEYS: Record<CheckItem['key'], string> = {
  device: 'ready.check.device',
  browser: 'ready.check.browser',
  camera: 'ready.check.camera',
  mic: 'ready.check.mic',
  network: 'ready.check.network',
};

export default function EnvironmentCheckPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const tickRef = useRef<number | null>(null);

  const [items, setItems] = useState<Record<CheckItem['key'], CheckItem>>({
    device: { key: 'device', status: 'pending', detail: '' },
    browser: { key: 'browser', status: 'pending', detail: '' },
    camera: { key: 'camera', status: 'pending', detail: '' },
    mic: { key: 'mic', status: 'pending', detail: '' },
    network: { key: 'network', status: 'pending', detail: '' },
  });
  const [micLevel, setMicLevel] = useState(0);
  const [running, setRunning] = useState(false);

  const setItem = (key: CheckItem['key'], patch: Partial<CheckItem>) =>
    setItems((p) => ({ ...p, [key]: { ...p[key], ...patch } }));

  const stopStreams = () => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    // Detach the stream from the <video> preview so Chromium releases the
    // OS-level camera indicator immediately. track.stop() alone leaves the
    // green light on while srcObject still references the (now-ended) stream.
    const v = videoRef.current;
    if (v) {
      try {
        v.pause();
        v.srcObject = null;
        v.removeAttribute('src');
        v.load();
      } catch {
        /* non-fatal */
      }
    }
    if (audioCtxRef.current) {
      try { void audioCtxRef.current.close(); } catch { /* ignore */ }
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
  };

  useEffect(() => {
    return () => stopStreams();
  }, []);

  const runChecks = async () => {
    setRunning(true);
    stopStreams();
    setMicLevel(0);

    // 1. Device
    setItem('device', { status: 'running', detail: '' });
    const ua = navigator.userAgent;
    const mobile = isMobileUA(ua);
    const cores = navigator.hardwareConcurrency || 0;
    if (mobile) {
      setItem('device', {
        status: 'fail',
        detail: 'Mobile device detected',
        hint: 'AXIS exams require a PC or laptop. Mobile and tablet devices are not supported.',
      });
    } else {
      setItem('device', {
        status: 'pass',
        detail: cores ? `Desktop · ${cores} CPU cores` : 'Desktop / laptop',
      });
    }

    // 2. Browser
    setItem('browser', { status: 'running', detail: '' });
    const browser = detectBrowser(ua);
    if (browser.name === 'Unknown') {
      setItem('browser', {
        status: 'fail',
        detail: 'Unrecognized browser',
        hint: 'Please use the latest version of Chrome.',
      });
    } else if (!browser.ok) {
      setItem('browser', {
        status: 'fail',
        detail: `${browser.name} ${browser.version} (too old)`,
        hint: 'Update to Chrome 90 or newer.',
      });
    } else if (browser.name !== 'Chrome') {
      setItem('browser', {
        status: 'warn',
        detail: `${browser.name} ${browser.version}`,
        hint: 'Chrome is recommended for the best proctoring experience.',
      });
    } else {
      setItem('browser', { status: 'pass', detail: `Chrome ${browser.version}` });
    }

    // 3. Camera
    setItem('camera', { status: 'running', detail: '' });
    let videoStream: MediaStream | null = null;
    try {
      videoStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: false,
      });
      const track = videoStream.getVideoTracks()[0];
      const settings = track.getSettings();
      setItem('camera', {
        status: 'pass',
        detail: `${track.label || 'Camera'} · ${settings.width ?? '?'}×${settings.height ?? '?'}`,
      });
      if (videoRef.current) videoRef.current.srcObject = videoStream;
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      const denied = e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError';
      const missing = e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError';
      setItem('camera', {
        status: 'fail',
        detail: denied
          ? 'Permission denied'
          : missing
          ? 'No camera detected'
          : e.message || 'Camera access failed',
        hint: denied
          ? 'Allow camera access in your browser settings, then re-run the check.'
          : missing
          ? 'Connect a webcam and try again.'
          : 'Close other apps that may be using the camera and re-run the check.',
      });
    }

    // 4. Microphone (separate request so denials are reported per-track)
    setItem('mic', { status: 'running', detail: '' });
    let audioStream: MediaStream | null = null;
    try {
      audioStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false },
      });
      const track = audioStream.getAudioTracks()[0];

      const Ctx: typeof AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') {
        try { await ctx.resume(); } catch { /* ignore */ }
      }
      const source = ctx.createMediaStreamSource(audioStream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      analyserRef.current = analyser;
      const buf = new Float32Array(new ArrayBuffer(analyser.fftSize * 4));

      // Keep the candidate in 'running' until the noise calibration completes —
      // the summary banner correctly reports "Running checks…" until then.
      setItem('mic', {
        status: 'running',
        detail: track.label || 'Microphone',
        hint: 'Calibrating room noise — please remain silent for 3 seconds…',
      });

      // Collect ambient samples during the calibration window. The level meter
      // runs continuously so the candidate sees mic activity; samples taken
      // while `collecting` is true feed the room-noise verdict.
      const noiseSamples: number[] = [];
      let collecting = true;
      tickRef.current = window.setInterval(() => {
        analyser.getFloatTimeDomainData(buf);
        let sumSq = 0;
        for (let i = 0; i < buf.length; i++) sumSq += buf[i] * buf[i];
        const rms = Math.sqrt(sumSq / buf.length);
        // Map RMS (~0..0.3 in normal speech) to 0..100
        setMicLevel(Math.min(100, Math.round(rms * 400)));
        if (collecting) noiseSamples.push(rms);
      }, 100);

      await new Promise<void>((resolve) =>
        window.setTimeout(resolve, NOISE_SAMPLE_MS),
      );
      collecting = false;

      // Bail if the user re-ran the check or unmounted mid-calibration —
      // stopStreams() nulls analyserRef, so a mismatch means our analyser was
      // torn down and we should not write a stale verdict.
      if (analyserRef.current === analyser) {
        const avg = noiseSamples.length
          ? noiseSamples.reduce((a, b) => a + b, 0) / noiseSamples.length
          : 0;
        const peak = noiseSamples.length ? Math.max(...noiseSamples) : 0;
        // Use peak as the gating signal so a single loud burst (a slammed door,
        // a passing car, a TV in another room) trips the fail. Otherwise a
        // mostly-quiet room with one spike could average down to a pass.
        const gate = Math.max(avg, peak * 0.7);
        const trackLabel = track.label || 'Microphone';
        if (gate >= NOISE_FAIL_THRESHOLD) {
          setItem('mic', {
            status: 'fail',
            detail: `${trackLabel} · room is too noisy (RMS ${gate.toFixed(3)})`,
            hint:
              'Background noise is too loud for proctoring. Move to a quieter location and re-run the check — the exam cannot be taken in a noisy environment because every voice event would terminate the session.',
          });
        } else if (gate >= NOISE_WARN_THRESHOLD) {
          setItem('mic', {
            status: 'warn',
            detail: `${trackLabel} · borderline ambient noise (RMS ${gate.toFixed(3)})`,
            hint:
              'Ambient noise is higher than recommended. A quieter room is strongly preferred — sustained sounds during the exam will trigger voice strikes.',
          });
        } else {
          setItem('mic', {
            status: 'pass',
            detail: `${trackLabel} · room is quiet (RMS ${gate.toFixed(3)})`,
            hint: 'Speak to verify the level meter responds.',
          });
        }
      }
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      const denied = e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError';
      const missing = e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError';
      setItem('mic', {
        status: 'fail',
        detail: denied
          ? 'Permission denied'
          : missing
          ? 'No microphone detected'
          : e.message || 'Microphone access failed',
        hint: denied
          ? 'Allow microphone access in your browser settings, then re-run the check.'
          : missing
          ? 'Connect a microphone and try again.'
          : 'Close other apps that may be using the microphone and re-run the check.',
      });
    }

    // Combine the streams onto a single ref so the cleanup tears down both.
    if (videoStream || audioStream) {
      const combined = new MediaStream();
      videoStream?.getTracks().forEach((t) => combined.addTrack(t));
      audioStream?.getTracks().forEach((t) => combined.addTrack(t));
      streamRef.current = combined;
    }

    // 5. Network
    setItem('network', { status: 'running', detail: '' });
    if (!navigator.onLine) {
      setItem('network', {
        status: 'fail',
        detail: 'Offline',
        hint: 'Reconnect to the internet, then re-run the check.',
      });
    } else {
      const conn = (navigator as unknown as {
        connection?: { effectiveType?: string; downlink?: number; rtt?: number };
      }).connection;
      const effectiveType = conn?.effectiveType;
      const downlink = conn?.downlink;
      const rtt = conn?.rtt;
      const slow = effectiveType === 'slow-2g' || effectiveType === '2g';
      const partsList = [
        effectiveType ? `Type: ${effectiveType}` : null,
        typeof downlink === 'number' ? `${downlink} Mbps` : null,
        typeof rtt === 'number' ? `${rtt} ms RTT` : null,
      ].filter(Boolean) as string[];
      const detail = partsList.length ? partsList.join(' · ') : 'Online';
      if (slow) {
        setItem('network', {
          status: 'warn',
          detail,
          hint: 'A faster connection is recommended for video proctoring.',
        });
      } else {
        setItem('network', { status: 'pass', detail });
      }
    }

    setRunning(false);
  };

  // Auto-run once on mount
  useEffect(() => {
    void runChecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = useMemo<CheckItem[]>(
    () => [items.device, items.browser, items.camera, items.mic, items.network],
    [items],
  );

  const summary = useMemo(() => {
    const counts = { pass: 0, warn: 0, fail: 0, other: 0 };
    for (const i of list) {
      if (i.status === 'pass') counts.pass += 1;
      else if (i.status === 'warn') counts.warn += 1;
      else if (i.status === 'fail') counts.fail += 1;
      else counts.other += 1;
    }
    const allDone = counts.other === 0;
    const ready = allDone && counts.fail === 0;
    return { ...counts, allDone, ready };
  }, [list]);

  return (
    <CbtShell title={t('envcheck.shell' as never)}>
      <div className="overflow-y-auto px-6 py-10 lg:px-12">
        <div className="mx-auto max-w-[960px]">
          <div className="mb-7">
            <button
              onClick={() => navigate(-1)}
              className="text-[12px] text-cyan-300 hover:text-cyan-200 transition-colors"
            >
              ← {t('common.back' as never)}
            </button>
            <h1 className="text-[28px] font-extrabold tracking-[-0.02em] text-white mt-3 mb-1">
              {t('envcheck.title' as never)}
            </h1>
            <p className="text-[13px] text-white/55">
              {t('envcheck.sub' as never)}
            </p>
          </div>

          {/* Step indicator — Prompt 14 */}
          <div className="flex items-center gap-2 mb-7">
            {[
              { n: 1, label: t('envcheck.steps.env' as never), active: true },
              { n: 2, label: t('envcheck.steps.id' as never), active: false },
              { n: 3, label: t('envcheck.steps.ai' as never), active: false },
              { n: 4, label: t('envcheck.steps.intro' as never), active: false },
              { n: 5, label: t('envcheck.steps.lobby' as never), active: false },
            ].map((s, i, arr) => (
              <div key={s.n} className="flex items-center flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 ${
                    s.active
                      ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-[0_0_12px_rgba(37,99,235,0.5)]'
                      : 'bg-white/[0.04] border-white/10 text-white/40'
                  }`}
                >
                  {s.n}
                </div>
                <span
                  className={`ml-2 text-[11px] font-medium ${
                    s.active ? 'text-white' : 'text-white/40'
                  }`}
                >
                  {s.label}
                </span>
                {i < arr.length - 1 && (
                  <div className="flex-1 h-px bg-white/[0.06] mx-2" />
                )}
              </div>
            ))}
          </div>

          <div
            className={`rounded-lg px-4 py-3 text-[13px] mb-4 flex items-start gap-2 ${
              !summary.allDone
                ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-200'
                : summary.ready
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200'
                : summary.fail > 0
                ? 'bg-red-500/10 border border-red-500/30 text-red-200'
                : 'bg-amber-500/10 border border-amber-500/30 text-amber-200'
            }`}
          >
            {!summary.allDone
              ? t('envcheck.summary.running' as never)
              : summary.ready
              ? t('envcheck.summary.ready' as never, { n: summary.pass })
              : summary.fail > 0
              ? t('envcheck.summary.fail' as never, { n: summary.fail })
              : t('envcheck.summary.warn' as never, { n: summary.warn })}
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] overflow-hidden mb-4">
            {list.map((item, idx) => {
              const Icon = ICONS[item.key];
              const pillCls = statusPillCls(item.status);
              return (
                <div
                  key={item.key}
                  className={`px-5 py-4 flex flex-col sm:flex-row sm:items-start sm:gap-4 ${
                    idx > 0 ? 'border-t border-white/[0.05]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-md bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-cyan-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[14px] font-semibold text-white">
                          {t(TITLE_KEYS[item.key] as never)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-[2px] rounded text-[10px] font-bold ${pillCls}`}
                        >
                          <StatusIcon status={item.status} />
                          {t(STATUS_KEY[item.status] as never)}
                        </span>
                      </div>
                      {item.detail && (
                        <div className="text-[12px] text-white/70 break-words">{item.detail}</div>
                      )}
                      {item.hint && item.status !== 'pass' && (
                        <div className="text-[11px] text-white/45 mt-1 break-words">
                          {item.hint}
                        </div>
                      )}
                      {item.key === 'camera' && item.status === 'pass' && (
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="mt-2.5 w-[240px] max-w-full h-auto rounded-md border border-cyan-300/30 bg-black"
                        />
                      )}
                      {item.key === 'mic' && item.status === 'pass' && (
                        <div className="mt-2.5">
                          <div className="text-[11px] text-white/55 mb-1">{t('envcheck.micLevel' as never)}</div>
                          <div className="h-1.5 w-[240px] max-w-full bg-white/[0.06] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-cyan-400 rounded-full transition-[width] duration-100"
                              style={{ width: `${micLevel}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => void runChecks()}
              disabled={running}
              className="px-4 py-2 rounded-lg text-[12px] font-semibold cursor-pointer transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/15 inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {running ? t('envcheck.rechecking' as never) : t('envcheck.recheck' as never)}
            </button>
            <button
              onClick={() => navigate('/mypage')}
              className="px-4 py-2 rounded-lg text-[12px] font-semibold cursor-pointer transition-colors whitespace-nowrap border border-white/15 bg-white/[0.03] text-white/85 hover:bg-white/[0.06]"
            >
              {t('envcheck.toMyPage' as never)}
            </button>
          </div>
        </div>
      </div>
    </CbtShell>
  );
}
