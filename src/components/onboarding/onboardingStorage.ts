/** localStorage keys for site-wide onboarding — bump version to replay for everyone. */

export const TOUR_KEYS = {
  journey: 'axis.siteTour.journey.v1',
  home: 'axis.siteTour.home.v1',
  mypage: 'axis.siteTour.mypage.v1',
  apply: 'axis.siteTour.apply.v1',
  cbt: 'axis.siteTour.cbt.v1',
  generic: 'axis.siteTour.generic.v1',
  demoIntro: 'axis.demoTour.intro.v2',
  demoGate: 'axis.demoTour.gate.v1',
  demoRunner: 'axis.demoTour.runner.v1',
  demoFsExit: 'axis.demoTour.fsExit.v1',
  demoResult: 'axis.demoTour.result.v2',
  demoCert: 'axis.demoTour.certificate.v1',
  demoVerify: 'axis.demoTour.verify.v1',
} as const;

/** Auto-show the tour this many times, then keep it accessible via the FAB only. */
export const MAX_AUTO_SHOWS = 3;

const COUNT_SUFFIX = '.count';

function readCount(storageKey: string): number {
  try {
    // Back-compat: old binary "done" sentinel counts as fully consumed.
    if (localStorage.getItem(storageKey) === 'done') return MAX_AUTO_SHOWS;
    const raw = localStorage.getItem(storageKey + COUNT_SUFFIX);
    if (!raw) return 0;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function getTourShowCount(storageKey: string): number {
  return readCount(storageKey);
}

export function isTourDone(storageKey: string): boolean {
  return readCount(storageKey) >= MAX_AUTO_SHOWS;
}

/**
 * Mark one auto-show as consumed. The "done" sentinel is also written once
 * the count tops out so legacy callers reading the old key still see it.
 */
export function incrementTourShowCount(storageKey: string): number {
  try {
    const next = readCount(storageKey) + 1;
    localStorage.setItem(storageKey + COUNT_SUFFIX, String(next));
    if (next >= MAX_AUTO_SHOWS) {
      localStorage.setItem(storageKey, 'done');
    }
    return next;
  } catch {
    return 0;
  }
}

/** Legacy alias — finalize the tour immediately (e.g. user explicitly opts out). */
export function markTourDone(storageKey: string): void {
  try {
    localStorage.setItem(storageKey + COUNT_SUFFIX, String(MAX_AUTO_SHOWS));
    localStorage.setItem(storageKey, 'done');
  } catch {
    /* ignore */
  }
}

function clearKey(storageKey: string) {
  try {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(storageKey + COUNT_SUFFIX);
  } catch {
    /* ignore */
  }
}

export function resetSiteTours(): void {
  [
    TOUR_KEYS.journey,
    TOUR_KEYS.home,
    TOUR_KEYS.mypage,
    TOUR_KEYS.apply,
    TOUR_KEYS.cbt,
    TOUR_KEYS.generic,
  ].forEach(clearKey);
}

export function resetDemoTours(): void {
  [
    TOUR_KEYS.demoIntro,
    TOUR_KEYS.demoGate,
    TOUR_KEYS.demoRunner,
    TOUR_KEYS.demoFsExit,
    TOUR_KEYS.demoResult,
    TOUR_KEYS.demoCert,
    TOUR_KEYS.demoVerify,
  ].forEach(clearKey);
}

export function resetAllTours(): void {
  resetSiteTours();
  resetDemoTours();
}
