/**
 * MobileTourSheet — mobile-first replacement for the spotlight tour.
 *
 * On phones the spotlight approach falls apart: most tour targets live in the
 * desktop nav (hidden behind the hamburger) or use left/right placements that
 * assume a wide, multi-column layout. Instead of pointing at elements that
 * aren't visible, mobile users get a clean bottom-sheet card deck that walks
 * through the same lessons sequentially. It shares the step/label types and the
 * auto-show budget with SpotlightTour so it's a drop-in swap.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Compass, X } from 'lucide-react';
import type { SpotlightTourStep, SpotlightTourLabels } from './SpotlightTour';
import { incrementTourShowCount, isTourDone } from './onboardingStorage';

interface Props {
  open: boolean;
  steps: SpotlightTourStep[];
  storageKey: string;
  labels: SpotlightTourLabels;
  forceOpen?: boolean;
  onClose: () => void;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function MobileTourSheet({ open, steps, storageKey, labels, forceOpen, onClose }: Props) {
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(false);
  const reducedMotion = prefersReducedMotion();

  const alreadyDone = useMemo(() => isTourDone(storageKey), [storageKey]);
  const shouldRender = open && (forceOpen || !alreadyDone) && steps.length > 0;

  const finish = useCallback(() => {
    if (!forceOpen) incrementTourShowCount(storageKey);
    onClose();
  }, [forceOpen, onClose, storageKey]);

  useEffect(() => {
    if (shouldRender) setIdx(0);
  }, [shouldRender]);

  // Slide-up entrance — flip `shown` on the next frame so the transition runs.
  useEffect(() => {
    if (!shouldRender) {
      setShown(false);
      return;
    }
    if (reducedMotion) {
      setShown(true);
      return;
    }
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, [shouldRender, reducedMotion]);

  const currentStep = steps[idx];

  useEffect(() => {
    if (!shouldRender) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        finish();
      } else if (e.key === 'ArrowRight') {
        setIdx((i) => Math.min(i + 1, steps.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setIdx((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shouldRender, steps.length, finish]);

  if (!shouldRender || !currentStep) return null;

  const isLast = idx === steps.length - 1;
  const isFirst = idx === 0;
  const progressPct = ((idx + 1) / steps.length) * 100;

  const goNext = () => {
    if (isLast) finish();
    else setIdx((i) => Math.min(i + 1, steps.length - 1));
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Site guide"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483600,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        fontFamily: 'var(--font-sans, ui-sans-serif, system-ui, "Noto Sans KR", sans-serif)',
      }}
    >
      {/* Backdrop — tap to dismiss */}
      <div
        onClick={finish}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(10, 14, 26, 0.55)',
          opacity: shown ? 1 : 0,
          transition: reducedMotion ? 'none' : 'opacity 220ms ease',
        }}
      />

      {/* Bottom sheet */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 520,
          background: '#FFFFFF',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -12px 48px rgba(0,0,0,0.22)',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
          transform: shown ? 'translateY(0)' : 'translateY(100%)',
          transition: reducedMotion ? 'none' : 'transform 300ms cubic-bezier(.16,1,.3,1)',
          overflow: 'hidden',
        }}
      >
        {/* Progress bar */}
        <div style={{ height: 4, background: '#F0F0F0' }}>
          <div
            style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #2563EB, #3B82F6)',
              transition: reducedMotion ? 'none' : 'width 240ms ease',
            }}
          />
        </div>

        {/* Grab handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10 }}>
          <span style={{ width: 40, height: 4, borderRadius: 999, background: '#E5E5E5' }} />
        </div>

        <div style={{ padding: '14px 22px 22px' }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <span
                style={{
                  flexShrink: 0,
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: '#F1F5FF',
                  color: '#2563EB',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Compass style={{ width: 18, height: 18 }} />
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#737373',
                  letterSpacing: 0.3,
                  textTransform: 'uppercase',
                }}
              >
                {labels.progress(idx + 1, steps.length)}
              </span>
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
                width: 34,
                height: 34,
                borderRadius: 9,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <X style={{ width: 17, height: 17 }} />
            </button>
          </div>

          <h3
            style={{
              margin: '18px 0 0',
              fontSize: 21,
              fontWeight: 700,
              lineHeight: 1.35,
              color: '#191919',
              letterSpacing: '-0.02em',
            }}
          >
            {currentStep.title}
          </h3>
          <p style={{ margin: '10px 0 0', fontSize: 15.5, lineHeight: 1.65, color: '#525252' }}>
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

          {/* Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 22 }}>
            {steps.map((s, i) => (
              <span
                key={s.id}
                style={{
                  width: i === idx ? 20 : 7,
                  height: 7,
                  borderRadius: 999,
                  background: i <= idx ? '#2563EB' : '#E5E5E5',
                  transition: reducedMotion ? 'none' : 'width 180ms ease, background 180ms ease',
                }}
              />
            ))}
          </div>

          {/* Controls — full-width, thumb-friendly */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18 }}>
            <button
              type="button"
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              disabled={isFirst}
              aria-label={labels.prev}
              style={{
                border: '1px solid #E5E5E5',
                background: '#FFFFFF',
                color: isFirst ? '#D4D4D4' : '#525252',
                width: 52,
                height: 52,
                borderRadius: 12,
                cursor: isFirst ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ChevronLeft style={{ width: 20, height: 20 }} />
            </button>
            <button
              type="button"
              onClick={goNext}
              style={{
                flex: 1,
                border: 'none',
                background: '#191919',
                color: '#FFFFFF',
                height: 52,
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              {isLast ? labels.finish : labels.next}
              {!isLast && <ChevronRight style={{ width: 18, height: 18 }} />}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default MobileTourSheet;
