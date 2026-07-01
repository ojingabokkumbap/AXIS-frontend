/**
 * SpotlightTour — professional guided tour with spotlight mask.
 * Used site-wide (home, mypage, apply) and inside the demo exam runner.
 */
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X, Compass } from 'lucide-react';
import { incrementTourShowCount, isTourDone } from './onboardingStorage';

export interface SpotlightTourStep {
  id: string;
  target?: string;
  title: string;
  body: string;
  /** Amber callout — typically "On the real exam" or demo-vs-real contrast. */
  realExam?: string;
  padding?: number;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  /**
   * Optional side-effect to run when this step becomes active — e.g. switch
   * to the tab whose button we're about to highlight so the user can see
   * what the spotlight is pointing at.
   */
  onEnter?: () => void;
}

export interface SpotlightTourLabels {
  next: string;
  prev: string;
  skip: string;
  finish: string;
  progress: (i: number, n: number) => string;
  realExam: string;
}

interface Props {
  open: boolean;
  steps: SpotlightTourStep[];
  storageKey: string;
  labels: SpotlightTourLabels;
  forceOpen?: boolean;
  /** Marketing pages use light card; CBT/dark pages can opt in later. */
  variant?: 'light' | 'brand';
  onClose: () => void;
}

const TOOLTIP_W = 420;
const TOOLTIP_MARGIN = 16;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function findTarget(selector: string | undefined): HTMLElement | null {
  if (!selector) return null;
  return document.querySelector(selector) as HTMLElement | null;
}

function isUsableRect(rect: DOMRect | null): boolean {
  if (!rect) return false;
  if (rect.width < 4 || rect.height < 4) return false;
  return true;
}

function scrollTargetIntoView(el: HTMLElement) {
  try {
    const vh = window.innerHeight;
    const r = el.getBoundingClientRect();
    // Only scroll if the target is mostly off-screen, and put it in the upper
    // third so there's room for the tooltip below.
    const visible = r.top >= 80 && r.bottom <= vh - 80;
    if (!visible) {
      el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
    }
  } catch {
    /* old browsers — fine */
  }
}

function resolvePlacement(
  rect: DOMRect,
  pref: SpotlightTourStep['placement'],
  vw: number,
  vh: number,
): 'top' | 'bottom' | 'left' | 'right' {
  if (pref && pref !== 'auto') return pref;
  const spaceBelow = vh - rect.bottom;
  const spaceAbove = rect.top;
  const spaceRight = vw - rect.right;
  const spaceLeft = rect.left;
  const max = Math.max(spaceBelow, spaceAbove, spaceRight, spaceLeft);
  if (max === spaceBelow) return 'bottom';
  if (max === spaceAbove) return 'top';
  if (max === spaceRight) return 'right';
  return 'left';
}

/** Actual tooltip width — never wider than the viewport (minus margins). */
function tooltipWidth(vw: number): number {
  return Math.min(TOOLTIP_W, vw - TOOLTIP_MARGIN * 2);
}

function computeTooltipPos(
  rect: DOMRect | null,
  placement: 'top' | 'bottom' | 'left' | 'right',
  vw: number,
  vh: number,
  tooltipH: number,
) {
  const tw = tooltipWidth(vw);
  if (!rect) {
    return {
      left: Math.max(TOOLTIP_MARGIN, (vw - tw) / 2),
      top: Math.max(16, (vh - tooltipH) / 2),
    };
  }
  let left = 0;
  let top = 0;
  switch (placement) {
    case 'bottom':
      left = rect.left + rect.width / 2 - tw / 2;
      top = rect.bottom + TOOLTIP_MARGIN;
      break;
    case 'top':
      left = rect.left + rect.width / 2 - tw / 2;
      top = rect.top - tooltipH - TOOLTIP_MARGIN;
      break;
    case 'right':
      left = rect.right + TOOLTIP_MARGIN;
      top = rect.top + rect.height / 2 - tooltipH / 2;
      break;
    case 'left':
      left = rect.left - tw - TOOLTIP_MARGIN;
      top = rect.top + rect.height / 2 - tooltipH / 2;
      break;
  }
  left = Math.max(12, Math.min(left, vw - tw - 12));
  top = Math.max(12, Math.min(top, vh - tooltipH - 12));
  return { left, top };
}

export function SpotlightTour({
  open,
  steps,
  storageKey,
  labels,
  forceOpen,
  variant = 'light',
  onClose,
}: Props) {
  const maskId = useId().replace(/:/g, '');
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [tooltipH, setTooltipH] = useState(240);
  const [viewport, setViewport] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 1280,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  });
  const reducedMotion = prefersReducedMotion();

  const alreadyDone = useMemo(() => isTourDone(storageKey), [storageKey]);
  const shouldRender = open && (forceOpen || !alreadyDone) && steps.length > 0;

  const finish = useCallback(() => {
    // Only count auto-shows toward the 3-strike limit; manual replays via the
    // FAB pass forceOpen and shouldn't burn through the budget.
    if (!forceOpen) incrementTourShowCount(storageKey);
    onClose();
  }, [forceOpen, onClose, storageKey]);

  useEffect(() => {
    if (shouldRender) setIdx(0);
  }, [shouldRender]);

  const currentStep = steps[idx];

  // Side-effect on entering a step (e.g. switch a tab so the spotlight has
  // something visible to highlight). Run before measuring.
  useEffect(() => {
    if (!shouldRender || !currentStep?.onEnter) return;
    currentStep.onEnter();
  }, [shouldRender, currentStep]);

  // Resolve the target on step change. Poll for up to 2s so we wait out
  // pages that mount their data asynchronously (e.g. My Page dashboard),
  // and gently scroll the element into the upper third of the viewport.
  useLayoutEffect(() => {
    if (!shouldRender || !currentStep) return;
    if (!currentStep.target) {
      setRect(null);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const tryResolve = () => {
      if (cancelled) return;
      const el = findTarget(currentStep.target);
      if (el) {
        scrollTargetIntoView(el);
        // Wait one frame so any scroll has updated layout before measuring.
        requestAnimationFrame(() => {
          if (cancelled) return;
          const r = el.getBoundingClientRect();
          setRect(isUsableRect(r) ? r : null);
        });
        return;
      }
      attempts += 1;
      if (attempts < 20) {
        window.setTimeout(tryResolve, 100);
      } else {
        // Give up after ~2s — render as centered modal so the user still sees
        // the lesson instead of an empty highlight.
        setRect(null);
      }
    };

    tryResolve();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRender, currentStep]);

  // Light-touch refresh of the rect — keeps the spotlight glued to the
  // element through layout changes (theme switches, sticky bars, etc).
  useEffect(() => {
    if (!shouldRender || !currentStep?.target) return;
    const refresh = () => {
      const el = findTarget(currentStep.target);
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (isUsableRect(r)) setRect(r);
    };
    const onResize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
      refresh();
    };
    const onScroll = () => refresh();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    const id = window.setInterval(refresh, 400);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
      window.clearInterval(id);
    };
  }, [shouldRender, currentStep]);

  useLayoutEffect(() => {
    if (!shouldRender || !tooltipRef.current) return;
    const h = tooltipRef.current.getBoundingClientRect().height;
    if (Math.abs(h - tooltipH) > 2) setTooltipH(h);
  }, [shouldRender, currentStep, rect, tooltipH]);

  useEffect(() => {
    if (!shouldRender) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        finish();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIdx((i) => Math.min(i + 1, steps.length - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIdx((i) => Math.max(0, i - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (idx === steps.length - 1) finish();
        else setIdx((i) => i + 1);
      }
    };
    window.addEventListener('keydown', onKey, { capture: true });
    return () => window.removeEventListener('keydown', onKey, { capture: true } as EventListenerOptions);
  }, [shouldRender, steps.length, idx, finish]);

  if (!shouldRender || !currentStep) return null;

  const placement = rect
    ? resolvePlacement(rect, currentStep.placement, viewport.w, viewport.h)
    : 'bottom';
  const pos = computeTooltipPos(rect, placement, viewport.w, viewport.h, tooltipH);
  const pad = currentStep.padding ?? 10;
  const isLast = idx === steps.length - 1;
  const isFirst = idx === 0;
  const progressPct = ((idx + 1) / steps.length) * 100;

  const holeX = rect ? Math.max(0, rect.left - pad) : 0;
  const holeY = rect ? Math.max(0, rect.top - pad) : 0;
  const holeW = rect ? rect.width + pad * 2 : 0;
  const holeH = rect ? rect.height + pad * 2 : 0;

  const accent = variant === 'brand' ? '#2563EB' : '#191919';
  const accentSoft = variant === 'brand' ? '#EFF6FF' : '#F5F5F7';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Site guide"
      className="axis-spotlight-tour"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483600,
        pointerEvents: 'auto',
        fontFamily: 'var(--font-sans, ui-sans-serif, system-ui, "Noto Sans KR", sans-serif)',
      }}
    >
      <svg
        width={viewport.w}
        height={viewport.h}
        style={{ position: 'fixed', inset: 0, pointerEvents: 'auto' }}
        onClick={(e) => {
          if (!rect) {
            if (!isLast) setIdx((i) => i + 1);
            return;
          }
          const { clientX: x, clientY: y } = e;
          const inHole =
            x >= holeX && x <= holeX + holeW && y >= holeY && y <= holeY + holeH;
          if (!inHole) {
            if (isLast) finish();
            else setIdx((i) => i + 1);
          }
        }}
      >
        <defs>
          <mask id={maskId}>
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect x={holeX} y={holeY} width={holeW} height={holeH} rx={12} ry={12} fill="black" />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(10, 14, 26, 0.72)"
          mask={`url(#${maskId})`}
        />
        {rect && (
          <>
            {/* Outer soft halo for contrast on dark/photo backgrounds */}
            <rect
              x={holeX}
              y={holeY}
              width={holeW}
              height={holeH}
              rx={14}
              ry={14}
              fill="none"
              stroke="rgba(255, 255, 255, 0.18)"
              strokeWidth={8}
            />
            {/* Primary brand ring */}
            <rect
              x={holeX}
              y={holeY}
              width={holeW}
              height={holeH}
              rx={12}
              ry={12}
              fill="none"
              stroke="#3B82F6"
              strokeWidth={2.5}
              style={{ filter: 'drop-shadow(0 0 18px rgba(59, 130, 246, 0.65))' }}
            />
            {/* Inner accent for crisp edge */}
            <rect
              x={holeX + 1}
              y={holeY + 1}
              width={Math.max(0, holeW - 2)}
              height={Math.max(0, holeH - 2)}
              rx={11}
              ry={11}
              fill="none"
              stroke="rgba(255, 255, 255, 0.35)"
              strokeWidth={1}
            />
          </>
        )}
      </svg>

      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          left: pos.left,
          top: pos.top,
          width: tooltipWidth(viewport.w),
          maxWidth: 'calc(100vw - 32px)',
          background: '#FFFFFF',
          color: '#191919',
          borderRadius: 20,
          boxShadow: '0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          transition: reducedMotion ? 'none' : 'left 200ms ease, top 200ms ease',
        }}
      >
        {/* Progress bar */}
        <div style={{ height: 4, background: '#F0F0F0' }}>
          <div
            style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #2563EB, #3B82F6)',
              transition: reducedMotion ? 'none' : 'width 220ms ease',
            }}
          />
        </div>

        <div style={{ padding: '22px 22px 18px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <span
                style={{
                  flexShrink: 0,
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: accentSoft,
                  color: accent,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Compass style={{ width: 18, height: 18 }} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#737373', letterSpacing: 0.3, textTransform: 'uppercase' }}>
                  {labels.progress(idx + 1, steps.length)}
                </div>
                <div style={{ display: 'flex', gap: 5, marginTop: 6 }}>
                  {steps.map((s, i) => (
                    <span
                      key={s.id}
                      style={{
                        width: i === idx ? 18 : 6,
                        height: 6,
                        borderRadius: 999,
                        background: i <= idx ? '#2563EB' : '#E5E5E5',
                        transition: reducedMotion ? 'none' : 'width 180ms ease, background 180ms ease',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={finish}
              aria-label={labels.skip}
              style={{
                border: 'none',
                background: '#F5F5F7',
                color: '#525252',
                cursor: 'pointer',
                width: 32,
                height: 32,
                borderRadius: 8,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>

          <h3
            style={{
              margin: '16px 0 0',
              fontSize: 20,
              fontWeight: 700,
              lineHeight: 1.35,
              color: '#191919',
              letterSpacing: '-0.02em',
            }}
          >
            {currentStep.title}
          </h3>
          <p
            style={{
              margin: '10px 0 0',
              fontSize: 15,
              lineHeight: 1.65,
              color: '#525252',
            }}
          >
            {currentStep.body}
          </p>

          {currentStep.realExam && (
            <div
              style={{
                marginTop: 16,
                borderRadius: 12,
                border: '1px solid #FDE68A',
                background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                padding: '12px 14px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#B45309',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 6,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} />
                {labels.realExam}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.55, color: '#78350F' }}>{currentStep.realExam}</div>
            </div>
          )}

          {/* Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 20,
              gap: 8,
            }}
          >
            <button
              type="button"
              onClick={finish}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#737373',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                padding: '8px 4px',
              }}
            >
              {labels.skip}
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setIdx((i) => Math.max(0, i - 1))}
                disabled={isFirst}
                aria-label={labels.prev}
                style={{
                  border: '1px solid #E5E5E5',
                  background: '#FFFFFF',
                  color: isFirst ? '#D4D4D4' : '#525252',
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  cursor: isFirst ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronLeft style={{ width: 18, height: 18 }} />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isLast) finish();
                  else setIdx((i) => i + 1);
                }}
                style={{
                  border: 'none',
                  background: '#191919',
                  color: '#FFFFFF',
                  padding: '0 18px',
                  height: 40,
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  minWidth: 96,
                  justifyContent: 'center',
                }}
              >
                {isLast ? labels.finish : labels.next}
                {!isLast && <ChevronRight style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
