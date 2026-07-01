import { useEffect, useState } from 'react';

/**
 * Shared mobile / small-viewport detection.
 *
 * Two flavours:
 *  - `isMobileDevice()` — user-agent based, for gating features that genuinely
 *    require a real PC/laptop (e.g. proctored exams). A desktop user shrinking
 *    their window is NOT a mobile device and must not be blocked.
 *  - `useIsMobile()` — reactive viewport hook, for layout / asset choices
 *    (e.g. swapping the hero video to a portrait-friendly source).
 */

/** Default breakpoint (px) below which we treat the viewport as "mobile". */
export const MOBILE_BREAKPOINT = 768;

/** True when the current user agent looks like a phone / tablet. */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const uaMobile = /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile|BlackBerry|webOS/i.test(ua);
  // iPadOS 13+ masquerades as desktop Safari — detect via touch points.
  const iPadOS =
    navigator.platform === 'MacIntel' &&
    typeof navigator.maxTouchPoints === 'number' &&
    navigator.maxTouchPoints > 1;
  return uaMobile || iPadOS;
}

/**
 * Should the current visitor be blocked from taking an exam / demo?
 *
 * We block real mobile/tablet devices OR extremely narrow viewports — either
 * way the proctoring + split-screen exam UI can't work reliably.
 */
export function isExamBlockedDevice(): boolean {
  if (isMobileDevice()) return true;
  if (typeof window !== 'undefined' && window.innerWidth > 0) {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }
  return false;
}

/** Reactive hook: true while the viewport width is below `breakpoint`. */
export function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT): boolean {
  const query = `(max-width: ${breakpoint - 1}px)`;
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
