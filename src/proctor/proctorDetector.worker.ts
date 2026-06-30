/// <reference lib="webworker" />
/**
 * Always-on face + gaze detector. Runs in a dedicated worker so the exam UI
 * stays responsive. The main thread captures one frame per ~200ms (5 Hz) via
 * `createImageBitmap(video)` and posts the bitmap to this worker; the bitmap
 * is transferable, so no pixels are copied.
 *
 * The worker replies with a lightweight `DetectorResult` per frame. The hook
 * (`useProctorMonitorLive`) holds the "sustain" timers and decides when to
 * fire a server event.
 */
import * as faceapi from '@vladmandic/face-api';

declare const self: DedicatedWorkerGlobalScope;

export type DetectorMessage =
  | { type: 'init'; modelUrl: string }
  | { type: 'detect'; bitmap: ImageBitmap; ts: number }
  | { type: 'shutdown' };

export type DetectorReply =
  | { type: 'ready'; backend: string }
  | { type: 'error'; message: string }
  | {
      type: 'result';
      ts: number;
      faceCount: number;
      yaw: number | null;
      pitch: number | null;
      roll: number | null;
      eyeOpenRatio: number | null;
      /**
       * Approximate iris-based eye yaw/pitch in degrees. Independent of head
       * pose: this is where the EYES are looking, regardless of where the
       * head is pointing. Negative yaw = looking left, positive = looking
       * right. Negative pitch = looking up, positive = looking down. Null
       * when iris analysis isn't possible (no OffscreenCanvas, no face,
       * eye region too small / too few dark pixels).
       */
      eyeYawDeg: number | null;
      eyePitchDeg: number | null;
      /** 0..1 — quality of the iris fit. Higher = more pixels matched the iris cluster. */
      eyeGazeConfidence: number | null;
      detectorMs: number;
    };

let ready = false;
let busy = false;

async function init(modelUrl: string) {
  // tf.setBackend resolves to `false` (does NOT throw) when the requested
  // backend isn't registered — common in workers without OffscreenCanvas.
  // The previous code only caught throws and silently ran on whatever
  // default tfjs picked (usually CPU), so detection ran 5–10× slower than
  // it should. Try webgl → wasm → cpu and verify each one actually took.
  const tf = (faceapi as unknown as {
    tf: {
      setBackend: (b: string) => Promise<boolean>;
      getBackend: () => string;
      ready: () => Promise<void>;
    };
  }).tf;

  const trySetBackend = async (name: string): Promise<boolean> => {
    try {
      const ok = await tf.setBackend(name);
      return ok === true;
    } catch {
      return false;
    }
  };

  if (!(await trySetBackend('webgl'))) {
    if (!(await trySetBackend('wasm'))) {
      await trySetBackend('cpu');
    }
  }
  await tf.ready();

  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelUrl),
  ]);
  ready = true;
  postReply({ type: 'ready', backend: tf.getBackend() });
}

function postReply(msg: DetectorReply, transfer?: Transferable[]) {
  if (transfer && transfer.length) self.postMessage(msg, transfer);
  else self.postMessage(msg);
}

const DETECTOR_OPTS = new faceapi.TinyFaceDetectorOptions({
  inputSize: 224,
  scoreThreshold: 0.5,
});

async function detect(bitmap: ImageBitmap, ts: number) {
  if (!ready) {
    bitmap.close?.();
    return;
  }
  if (busy) {
    // Drop frames if the previous one is still running. 5 Hz cadence + ~30ms
    // detector cost makes this rare, but it keeps the queue from stacking up.
    bitmap.close?.();
    return;
  }
  busy = true;
  const t0 = performance.now();
  try {
    // face-api accepts anything tfjs.browser.fromPixels can read; ImageBitmap is supported.
    const detections = await faceapi
      .detectAllFaces(bitmap as unknown as HTMLCanvasElement, DETECTOR_OPTS)
      .withFaceLandmarks(true);
    // NOTE: bitmap is closed at the end of detect() — estimateEyeGaze() needs
    // it to read pixels for iris analysis.

    const faceCount = detections.length;
    let yaw: number | null = null;
    let pitch: number | null = null;
    let roll: number | null = null;
    let eyeOpenRatio: number | null = null;
    let eyeYawDeg: number | null = null;
    let eyePitchDeg: number | null = null;
    let eyeGazeConfidence: number | null = null;

    if (faceCount === 1) {
      const lm = detections[0].landmarks.positions;
      const pose = estimatePose(lm);
      yaw = pose.yaw;
      pitch = pose.pitch;
      roll = pose.roll;
      eyeOpenRatio = computeEyeOpenness(lm);

      // Iris-based eye gaze. Independent signal from head pose — catches
      // candidates who keep their head facing the camera but cut their eyes
      // sideways to read a second monitor. STRICT preset: 12°/15° thresholds.
      const gaze = estimateEyeGaze(bitmap, lm);
      eyeYawDeg = gaze.yawDeg;
      eyePitchDeg = gaze.pitchDeg;
      eyeGazeConfidence = gaze.confidence;
    }

    bitmap.close?.();
    postReply({
      type: 'result',
      ts,
      faceCount,
      yaw,
      pitch,
      roll,
      eyeOpenRatio,
      eyeYawDeg,
      eyePitchDeg,
      eyeGazeConfidence,
      detectorMs: Math.round(performance.now() - t0),
    });
  } catch (err) {
    bitmap.close?.();
    postReply({ type: 'error', message: String((err as Error)?.message ?? err) });
  } finally {
    busy = false;
  }
}

interface Pt { x: number; y: number }

/**
 * Cheap pose estimate from 68 landmarks. We don't need millimetre-accurate
 * pose — just enough to flag |yaw| > 25° / pitch < -15°. Yaw is derived from
 * the horizontal offset of the nose tip relative to the face midline,
 * normalised by half the face width. Pitch from the nose-tip Y position
 * between the eye-line and the chin. Roll from the eye-line slope.
 */
function estimatePose(lm: Pt[]): { yaw: number; pitch: number; roll: number } {
  const left = lm[0];
  const right = lm[16];
  const noseTip = lm[30];
  const eyeMidY = (lm[36].y + lm[39].y + lm[42].y + lm[45].y) / 4;
  const eyeMidX = (lm[36].x + lm[39].x + lm[42].x + lm[45].x) / 4;
  const chinY = lm[8].y;

  const faceMidX = (left.x + right.x) / 2;
  const faceWidth = Math.hypot(right.x - left.x, right.y - left.y) || 1;
  const yawNorm = (noseTip.x - faceMidX) / (faceWidth / 2);
  const yaw = clamp(yawNorm * 90, -90, 90);

  const eyeToChin = chinY - eyeMidY || 1;
  const pitchNorm = (noseTip.y - eyeMidY) / eyeToChin - 0.5;
  const pitch = clamp(pitchNorm * 90, -90, 90);

  const eyeRightX = (lm[42].x + lm[45].x) / 2;
  const eyeRightY = (lm[42].y + lm[45].y) / 2;
  const eyeLeftX = (lm[36].x + lm[39].x) / 2;
  const eyeLeftY = (lm[36].y + lm[39].y) / 2;
  const roll = (Math.atan2(eyeRightY - eyeLeftY, eyeRightX - eyeLeftX) * 180) / Math.PI;

  // Reference points so the linter is happy.
  void eyeMidX;

  return { yaw, pitch, roll };
}

/**
 * Iris-based eye gaze estimation. The 68-landmark face model gives us 6 points
 * around each eye (right=36..41, left=42..47) but no iris position. We
 * approximate the iris/pupil center by:
 *   1. Cropping the eye-region bounding box from the source bitmap
 *   2. Downscaling to a fixed working resolution (cheap to scan)
 *   3. Identifying the dark cluster (iris+pupil are darker than sclera)
 *   4. Computing the centroid of the dark cluster
 *   5. Comparing the centroid to the eye-region geometric center
 *
 * The horizontal offset of the centroid from the eye-region center, normalized
 * by half the eye-region width, gives an "eye yaw" signal. Vertical offset
 * (normalized by half the height) gives "eye pitch". Multiplying by ~35°
 * (the approximate range of human eye rotation) converts to degrees.
 *
 * Returned `confidence` reflects how many pixels matched the iris cluster
 * relative to the working area — drops to ~0 for blurred/closed eyes, very
 * dark frames, or when the eye region is too small (< 12 px wide).
 *
 * Caveats: glasses (especially with reflections), heavy eyeliner, and very
 * dark room lighting can degrade accuracy. Hook callers should gate the
 * eye-gaze signal on `confidence > 0.3` before triggering a strike.
 */
const eyeWorkCanvas: OffscreenCanvas | null =
  typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(80, 40) : null;
const eyeWorkCtx = eyeWorkCanvas?.getContext('2d', { willReadFrequently: true }) ?? null;
const RIGHT_EYE_IDX = [36, 37, 38, 39, 40, 41];
const LEFT_EYE_IDX = [42, 43, 44, 45, 46, 47];

function estimateEyeGaze(
  bitmap: ImageBitmap,
  lm: Pt[],
): { yawDeg: number | null; pitchDeg: number | null; confidence: number | null } {
  if (!eyeWorkCanvas || !eyeWorkCtx) {
    return { yawDeg: null, pitchDeg: null, confidence: null };
  }
  const right = analyzeEye(bitmap, lm, RIGHT_EYE_IDX);
  const left = analyzeEye(bitmap, lm, LEFT_EYE_IDX);
  if (!right && !left) return { yawDeg: null, pitchDeg: null, confidence: 0 };

  // Average available eyes. Weighting by per-eye confidence makes a single
  // bad eye (occlusion, makeup, glasses glare) drag the result less.
  const list = [right, left].filter((e): e is EyeAnalysis => e !== null);
  let totalConf = 0;
  let yawSum = 0;
  let pitchSum = 0;
  for (const e of list) {
    yawSum += e.offsetX * e.confidence;
    pitchSum += e.offsetY * e.confidence;
    totalConf += e.confidence;
  }
  if (totalConf < 1e-3) return { yawDeg: 0, pitchDeg: 0, confidence: 0 };
  const yawNorm = yawSum / totalConf; // -1..+1, mirrors source so + = looking right
  const pitchNorm = pitchSum / totalConf;
  const confidence = Math.min(1, totalConf / list.length);

  // Approx human eye rotation range: ±35° horizontal, ±25° vertical.
  return {
    yawDeg: yawNorm * 35,
    pitchDeg: pitchNorm * 25,
    confidence,
  };
}

interface EyeAnalysis {
  offsetX: number;
  offsetY: number;
  confidence: number;
}

function analyzeEye(bitmap: ImageBitmap, lm: Pt[], idx: number[]): EyeAnalysis | null {
  if (!eyeWorkCanvas || !eyeWorkCtx) return null;
  // Bounding box of eye landmarks
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const i of idx) {
    const p = lm[i];
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const w = maxX - minX;
  const h = maxY - minY;
  if (w < 12 || h < 4) return null;

  // Expand a touch (5%) so we capture the eye lid edges
  const padX = w * 0.05;
  const padY = h * 0.1;
  const sx = Math.max(0, minX - padX);
  const sy = Math.max(0, minY - padY);
  const sw = Math.min(bitmap.width - sx, w + padX * 2);
  const sh = Math.min(bitmap.height - sy, h + padY * 2);
  if (sw < 6 || sh < 3) return null;

  // Downscale to a fixed working resolution. 80×wide preserves enough detail
  // for centroid calculation while keeping the pixel scan O(few thousand).
  const TW = 80;
  const TH = Math.max(8, Math.min(40, Math.round((sh / sw) * TW)));
  eyeWorkCtx.clearRect(0, 0, eyeWorkCanvas.width, eyeWorkCanvas.height);
  try {
    eyeWorkCtx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, TW, TH);
  } catch {
    return null;
  }
  let imageData: ImageData;
  try {
    imageData = eyeWorkCtx.getImageData(0, 0, TW, TH);
  } catch {
    return null;
  }
  const data = imageData.data;

  // Pass 1: mean luminance
  let lumSum = 0;
  let lumCount = 0;
  for (let i = 0; i < data.length; i += 4) {
    lumSum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    lumCount += 1;
  }
  const mean = lumSum / lumCount;
  // Threshold at 60% of mean — empirically the iris+pupil cluster is well
  // below the sclera mean. Too tight (e.g. 75%) misses light irises; too
  // loose (e.g. 40%) starts catching eyelashes + brow shadow.
  const thresh = mean * 0.6;

  let cx = 0, cy = 0, count = 0;
  for (let y = 0; y < TH; y++) {
    for (let x = 0; x < TW; x++) {
      const k = (y * TW + x) * 4;
      const lum = 0.299 * data[k] + 0.587 * data[k + 1] + 0.114 * data[k + 2];
      if (lum < thresh) {
        cx += x;
        cy += y;
        count += 1;
      }
    }
  }
  // Need at least a small cluster to trust the centroid. Closed eyes / very
  // bright frames produce 0–few matches → return null so the hook ignores
  // this signal rather than acting on noise.
  if (count < 6) return null;
  cx /= count;
  cy /= count;
  // Normalize to -1..+1 where 0 is the eye-region center. Note the camera
  // is mirrored, so positive offsetX = looking RIGHT in the user's frame.
  const offsetX = (cx - TW / 2) / (TW / 2);
  const offsetY = (cy - TH / 2) / (TH / 2);
  // Confidence: density of iris cluster vs working area, capped at 1.
  // Ideal eye: the iris+pupil should occupy 8–20% of the eye bbox.
  const density = count / (TW * TH);
  const confidence = Math.min(1, density / 0.08);

  return { offsetX, offsetY, confidence };
}

/**
 * Mean Eye Aspect Ratio across both eyes. A 6-point eye outline gives
 * EAR = (||p1-p5|| + ||p2-p4||) / (2*||p0-p3||). Threshold ~0.20 → closed.
 */
function computeEyeOpenness(lm: Pt[]): number {
  const ear = (idx: number[]): number => {
    const p = idx.map((i) => lm[i]);
    const v1 = Math.hypot(p[1].x - p[5].x, p[1].y - p[5].y);
    const v2 = Math.hypot(p[2].x - p[4].x, p[2].y - p[4].y);
    const h = Math.hypot(p[0].x - p[3].x, p[0].y - p[3].y) || 1;
    return (v1 + v2) / (2 * h);
  };
  const right = ear([36, 37, 38, 39, 40, 41]);
  const left = ear([42, 43, 44, 45, 46, 47]);
  return (right + left) / 2;
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

self.onmessage = (e: MessageEvent<DetectorMessage>) => {
  const msg = e.data;
  if (msg.type === 'init') {
    init(msg.modelUrl).catch((err) =>
      postReply({ type: 'error', message: String((err as Error)?.message ?? err) }),
    );
  } else if (msg.type === 'detect') {
    void detect(msg.bitmap, msg.ts);
  } else if (msg.type === 'shutdown') {
    self.close();
  }
};
