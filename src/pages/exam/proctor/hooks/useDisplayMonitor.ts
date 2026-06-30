import { useCallback, useEffect, useRef, useState } from 'react';
import { proctorApi, type ProctorEventKind } from '@/services/api';
import { captureViolationFrames } from '@/proctor/violationEvidence';

export interface DisplayInfo {
  label: string;
  width: number;
  height: number;
  isPrimary: boolean;
  isInternal: boolean | null;
  left: number;
  top: number;
}

export interface DisplayState {
  /** True while a second monitor / extended desktop / geometry mismatch is detected. */
  blocked: boolean;
  /** Number of displays the browser reports (1 if API unavailable). */
  displayCount: number;
  /** Raw flag from window.screen.isExtended (Window Management API). */
  isExtended: boolean;
  /** Geometry mismatch heuristic — width/availWidth or screenX/Y inconsistency. */
  geometryMismatch: boolean;
  /** Per-display info if `getScreenDetails()` was authorised. */
  displays: DisplayInfo[];
  /** True once the user has allowed window-management permission (or browser doesn't gate it). */
  permissionGranted: boolean;
  /** Shown to the user when the browser blocks the permission API. */
  permissionError: string | null;
  /** Last event we sent to the server, so we don't spam on every poll. */
  lastReportedAt: number | null;
}

interface Options {
  /** Disable when not in an exam (e.g. demo mode). */
  enabled: boolean;
  /** Session id used when posting the proctor event. If null we don't post — caller is the demo page. */
  sessionId?: string;
  /** Poll interval in ms. Default 5s. */
  intervalMs?: number;
}

const POLL_DEFAULT = 5_000;
const REPORT_COOLDOWN_MS = 60_000;

type ScreenWithExtras = Screen & {
  isExtended?: boolean;
};
type WindowWithScreenDetails = Window & {
  getScreenDetails?: () => Promise<ScreenDetails>;
};
interface ScreenDetailed {
  label?: string;
  width: number;
  height: number;
  isPrimary?: boolean;
  isInternal?: boolean;
  left: number;
  top: number;
}
interface ScreenDetails {
  screens: ScreenDetailed[];
  currentScreen: ScreenDetailed;
  addEventListener: (ev: 'screenschange', cb: () => void) => void;
  removeEventListener: (ev: 'screenschange', cb: () => void) => void;
}

/**
 * Detects external monitors / extended desktops during an exam.
 *
 * Strategy (combined — no single check is reliable):
 *   1. window.screen.isExtended — Window Management API hint, true on multi-monitor.
 *   2. getScreenDetails() — exact list of physical displays (requires permission).
 *   3. Geometry: window.screen.width vs availWidth and screenX/screenY out-of-bounds.
 *
 * The hook polls every `intervalMs` and reports the first transition into a
 * blocked state to the server (rate-limited to once per minute). The caller
 * shows the blocking modal based on `state.blocked`.
 */
export function useDisplayMonitor(opts: Options): {
  state: DisplayState;
  recheck: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
} {
  const { enabled, sessionId, intervalMs = POLL_DEFAULT } = opts;
  const [state, setState] = useState<DisplayState>({
    blocked: false,
    displayCount: 1,
    isExtended: false,
    geometryMismatch: false,
    displays: [],
    permissionGranted: false,
    permissionError: null,
    lastReportedAt: null,
  });
  const screenDetailsRef = useRef<ScreenDetails | null>(null);
  const lastReportedAtRef = useRef<number | null>(null);
  const wasBlockedRef = useRef(false);

  const computeFromDetails = useCallback((details: ScreenDetails | null): Partial<DisplayState> => {
    const sx = window.screen as ScreenWithExtras;
    const isExtended = sx.isExtended === true;

    const widthMismatch = window.screen.availWidth > 0 && window.screen.width > window.screen.availWidth * 1.1;
    const offscreen =
      window.screenX < -50 ||
      window.screenY < -50 ||
      window.screenX > window.screen.width + 50 ||
      window.screenY > window.screen.height + 50;
    const geometryMismatch = widthMismatch || offscreen;

    const displays: DisplayInfo[] = details
      ? details.screens.map((s, i) => ({
          label: s.label || `Display ${i + 1}`,
          width: s.width,
          height: s.height,
          isPrimary: s.isPrimary ?? i === 0,
          isInternal: s.isInternal ?? null,
          left: s.left,
          top: s.top,
        }))
      : [];
    const displayCount = details ? details.screens.length : isExtended ? 2 : 1;
    const blocked = displayCount > 1 || isExtended || geometryMismatch;

    return { isExtended, geometryMismatch, displays, displayCount, blocked };
  }, []);

  const reportToServer = useCallback(
    async (next: DisplayState) => {
      if (!sessionId) return;
      if (!next.blocked) return;
      const now = Date.now();
      if (lastReportedAtRef.current && now - lastReportedAtRef.current < REPORT_COOLDOWN_MS) return;
      lastReportedAtRef.current = now;
      const type: ProctorEventKind = 'EXTERNAL_DISPLAY';
      try {
        const frames = await captureViolationFrames();
        await proctorApi.event(sessionId, {
          type,
          ...frames,
          detail: {
            displayCount: next.displayCount,
            isExtended: next.isExtended,
            geometryMismatch: next.geometryMismatch,
            displays: next.displays.map((d) => ({
              label: d.label,
              width: d.width,
              height: d.height,
              isPrimary: d.isPrimary,
              isInternal: d.isInternal,
            })),
            screen: {
              width: window.screen.width,
              height: window.screen.height,
              availWidth: window.screen.availWidth,
              availHeight: window.screen.availHeight,
              screenX: window.screenX,
              screenY: window.screenY,
            },
          },
        });
      } catch {
        // Soft-fail; the modal is already showing locally.
      }
    },
    [sessionId],
  );

  const refresh = useCallback(async () => {
    const partial = computeFromDetails(screenDetailsRef.current);
    setState((prev) => {
      const next: DisplayState = {
        ...prev,
        ...partial,
        lastReportedAt: lastReportedAtRef.current,
      };
      const justBecameBlocked = !!partial.blocked && !wasBlockedRef.current;
      wasBlockedRef.current = !!partial.blocked;
      if (justBecameBlocked) void reportToServer(next);
      return next;
    });
  }, [computeFromDetails, reportToServer]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const w = window as unknown as WindowWithScreenDetails;
    if (typeof w.getScreenDetails !== 'function') {
      setState((p) => ({ ...p, permissionGranted: true, permissionError: null }));
      return true;
    }
    try {
      const details = await w.getScreenDetails();
      screenDetailsRef.current = details;
      details.addEventListener('screenschange', refresh);
      setState((p) => ({ ...p, permissionGranted: true, permissionError: null }));
      await refresh();
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Permission denied';
      setState((p) => ({ ...p, permissionGranted: false, permissionError: msg }));
      return false;
    }
  }, [refresh]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const poll = window.setInterval(() => {
      if (cancelled) return;
      void refresh();
    }, intervalMs);
    void refresh();

    const onResize = () => void refresh();
    window.addEventListener('resize', onResize);

    return () => {
      cancelled = true;
      window.clearInterval(poll);
      window.removeEventListener('resize', onResize);
      const details = screenDetailsRef.current;
      if (details) {
        try {
          details.removeEventListener('screenschange', refresh);
        } catch {
          // ignore
        }
      }
    };
  }, [enabled, intervalMs, refresh]);

  return { state, recheck: refresh, requestPermission };
}
