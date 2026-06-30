import { useEffect, useRef, useState } from 'react';
import { proctorApi } from '@/services/api';

export type ProctorVerdict = 'OK' | 'NO_FACE' | 'MULTIPLE_FACES' | 'LOOK_AWAY' | 'EYES_CLOSED' | 'ERROR' | 'PENDING';

export interface ProctorState {
  verdict: ProctorVerdict;
  faceCount: number | null;
  yaw: number | null;
  pitch: number | null;
  lastCheckedAt: number | null;
  warnings: number; // running count of non-OK verdicts
}

interface Options {
  enabled: boolean;
  intervalMs?: number;        // default 30 s
  purpose: 'DEMO' | 'EXAM';
  sessionId?: string;
}

/**
 * Acquires a hidden webcam stream and POSTs a frame to /cbt/proctor/face-check
 * every `intervalMs`. Returns the latest verdict + a ref to attach to a <video>
 * element for visual debug if desired.
 *
 * Renders only the hook — no UI. Pair with <ProctorBanner /> to show alerts.
 */
export function useProctorMonitor(opts: Options): {
  state: ProctorState;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  start: () => Promise<void>;
  stop: () => void;
} {
  const { enabled, intervalMs = 30_000, purpose, sessionId } = opts;
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const tickRef = useRef<number | null>(null);
  const [state, setState] = useState<ProctorState>({
    verdict: 'PENDING',
    faceCount: null,
    yaw: null,
    pitch: null,
    lastCheckedAt: null,
    warnings: 0,
  });

  const start = async () => {
    if (streamRef.current) return;
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      setState((p) => ({ ...p, verdict: 'ERROR' }));
    }
  };

  const stop = () => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    // Detach the stream from the <video> element so the OS camera indicator
    // (green light) is released immediately on Chromium browsers — calling
    // track.stop() alone is not enough while srcObject still references it.
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
  };

  const captureBase64 = (): string | null => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return null;
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(v, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.7).split(',')[1] ?? null;
  };

  const runCheck = async () => {
    const b64 = captureBase64();
    if (!b64) return;
    try {
      const res = await proctorApi.faceCheck(b64, { purpose, sessionId });
      const d = res.data as ProctorState & { verdict: ProctorVerdict; checkedAt: string };
      setState((prev) => ({
        verdict: d.verdict,
        faceCount: d.faceCount,
        yaw: d.yaw,
        pitch: d.pitch,
        lastCheckedAt: Date.now(),
        warnings: prev.warnings + (d.verdict === 'OK' ? 0 : 1),
      }));
    } catch {
      setState((p) => ({ ...p, verdict: 'ERROR', lastCheckedAt: Date.now() }));
    }
  };

  // Lifecycle
  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }
    start();
    tickRef.current = window.setInterval(runCheck, intervalMs);
    // First check after a short warmup so the camera has time to expose
    const warmup = window.setTimeout(runCheck, 3000);
    return () => {
      window.clearTimeout(warmup);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, intervalMs, purpose, sessionId]);

  return { state, videoRef, start, stop };
}

export function ProctorBanner({ state }: { state: ProctorState }) {
  if (state.verdict === 'OK' || state.verdict === 'PENDING') return null;
  const messages: Record<ProctorVerdict, string> = {
    OK: '',
    PENDING: '',
    NO_FACE: 'No face detected — return to camera view.',
    MULTIPLE_FACES: 'Multiple faces detected — only the test-taker may be in frame.',
    LOOK_AWAY: 'Please look at the screen.',
    EYES_CLOSED: 'Eyes appear closed — please face the camera.',
    ERROR: 'Proctoring check failed (camera or network).',
  };
  const tone =
    state.verdict === 'ERROR' || state.verdict === 'NO_FACE' || state.verdict === 'MULTIPLE_FACES'
      ? 'bg-red-600'
      : 'bg-amber-600';
  return (
    <div
      className={`${tone} text-white text-xs px-4 py-1.5 flex items-center gap-3 font-medium`}
      role="alert"
    >
      <span className="font-bold uppercase">Proctor</span>
      <span className="flex-1">{messages[state.verdict]}</span>
      <span className="opacity-80 font-mono">
        faces={state.faceCount ?? '?'} · yaw={state.yaw?.toFixed(0) ?? '?'} · pitch=
        {state.pitch?.toFixed(0) ?? '?'}
      </span>
    </div>
  );
}

export function ProctorPipPreview({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement | null> }) {
  return (
    <div className="fixed bottom-3 right-3 w-32 h-24 bg-black border border-gray-700 rounded shadow-lg overflow-hidden z-50">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 text-[9px] text-white bg-black/60 px-1 py-0.5">
        proctor
      </div>
    </div>
  );
}
