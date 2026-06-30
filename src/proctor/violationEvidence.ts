/**
 * Capture-on-violation evidence registry.
 *
 * Proctor violation events are reported from several hooks (fullscreen guard,
 * display monitor, AI monitor, duplicate-tab guard). To attach a snapshot taken
 * at the *exact moment* of the offence — independent of whether an admin is
 * live-monitoring — the runner registers its webcam + screen frame capturers
 * here once, and every event reporter calls `captureViolationFrames()` right
 * before POSTing the event.
 *
 * Capture is best-effort: a missing/failed capturer yields no frame and never
 * blocks or throws into the violation-reporting path.
 */
type FrameCapturer = () => string | null | Promise<string | null>;

let webcamCapturer: FrameCapturer | null = null;
let screenCapturer: FrameCapturer | null = null;

export function registerViolationCapturers(opts: {
  webcam?: FrameCapturer | null;
  screen?: FrameCapturer | null;
}): void {
  if ('webcam' in opts) webcamCapturer = opts.webcam ?? null;
  if ('screen' in opts) screenCapturer = opts.screen ?? null;
}

export interface ViolationFrames {
  webcamFrameBase64?: string;
  screenFrameBase64?: string;
}

export async function captureViolationFrames(): Promise<ViolationFrames> {
  const out: ViolationFrames = {};
  try {
    const w = webcamCapturer ? await webcamCapturer() : null;
    if (w) out.webcamFrameBase64 = w;
  } catch {
    /* best-effort */
  }
  try {
    const s = screenCapturer ? await screenCapturer() : null;
    if (s) out.screenFrameBase64 = s;
  } catch {
    /* best-effort */
  }
  return out;
}
