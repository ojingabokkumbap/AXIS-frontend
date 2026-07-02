/**
 * MobileSiteGuideModal — one-time bottom sheet for phone visitors.
 *
 * Explains what works well on a phone (registration & payment, My Page,
 * results & certificate verification) and calls out the one thing that
 * doesn't: demo/real exams need webcam proctoring + fullscreen, so they are
 * desktop-only (enforced by MobileExamGuard). Auto-shows once per device,
 * after the journey welcome modal and before any page tour.
 */
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ClipboardList, CreditCard, Monitor, ShieldCheck, X } from 'lucide-react';
import { markTourDone, TOUR_KEYS } from './onboardingStorage';

export interface MobileSiteGuideLabels {
  badge: string;
  title: string;
  subtitle: string;
  can1Title: string;
  can1Body: string;
  can2Title: string;
  can2Body: string;
  can3Title: string;
  can3Body: string;
  pcTitle: string;
  pcBody: string;
  confirm: string;
  close: string;
}

interface Props {
  open: boolean;
  labels: MobileSiteGuideLabels;
  onClose: () => void;
}

const FEATURES = [
  { icon: CreditCard, tone: '#2563EB', bg: '#EFF6FF' },
  { icon: ClipboardList, tone: '#191919', bg: '#F5F5F7' },
  { icon: ShieldCheck, tone: '#16A34A', bg: '#F0FDF4' },
] as const;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function MobileSiteGuideModal({ open, labels, onClose }: Props) {
  const [shown, setShown] = useState(false);
  const reducedMotion = prefersReducedMotion();

  const dismiss = useCallback(() => {
    markTourDone(TOUR_KEYS.mobileGuide);
    onClose();
  }, [onClose]);

  // Slide-up entrance — flip `shown` on the frame after `open` changes so the
  // CSS transition runs; reduced motion is covered by `transition: none`.
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(open));
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        dismiss();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, dismiss]);

  if (!open) return null;

  const features = [
    { title: labels.can1Title, body: labels.can1Body },
    { title: labels.can2Title, body: labels.can2Body },
    { title: labels.can3Title, body: labels.can3Body },
  ];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-site-guide-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483550,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'rgba(15, 18, 28, 0.55)',
        backdropFilter: 'blur(6px)',
        opacity: shown ? 1 : 0,
        transition: reducedMotion ? 'none' : 'opacity 220ms ease',
        fontFamily: 'var(--font-sans, ui-sans-serif, "Noto Sans KR", sans-serif)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: '90dvh',
          display: 'flex',
          flexDirection: 'column',
          background: '#FFFFFF',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -12px 48px rgba(0,0,0,0.22)',
          overflow: 'hidden',
          transform: shown ? 'translateY(0)' : 'translateY(100%)',
          transition: reducedMotion ? 'none' : 'transform 300ms cubic-bezier(.16,1,.3,1)',
        }}
      >
        <div
          style={{
            flexShrink: 0,
            padding: '20px 20px 16px',
            background: 'linear-gradient(135deg, #191919 0%, #2d3748 100%)',
            color: '#fff',
            position: 'relative',
          }}
        >
          <button
            type="button"
            onClick={dismiss}
            aria-label={labels.close}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              border: 'none',
              background: 'rgba(255,255,255,0.12)',
              color: '#fff',
              width: 36,
              height: 36,
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', opacity: 0.7 }}>
            {labels.badge}
          </div>
          <h2
            id="mobile-site-guide-title"
            style={{
              margin: '8px 0 0',
              fontSize: 21,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.25,
              wordBreak: 'keep-all',
            }}
          >
            {labels.title}
          </h2>
          <p
            style={{
              margin: '10px 0 0',
              fontSize: 14,
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.82)',
              wordBreak: 'keep-all',
            }}
          >
            {labels.subtitle}
          </p>
        </div>

        {/* Feature list + PC notice — scrolls independently so the confirm
            button stays reachable on short screens. */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '4px 18px 8px',
          }}
        >
          {features.map((feature, i) => {
            const meta = FEATURES[i];
            const Icon = meta.icon;
            return (
              <div
                key={feature.title}
                style={{
                  display: 'flex',
                  gap: 14,
                  padding: '14px 0',
                  borderBottom: i < features.length - 1 ? '1px solid #F0F0F0' : 'none',
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: meta.bg,
                    color: meta.tone,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon style={{ width: 22, height: 22 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#191919', wordBreak: 'keep-all' }}>
                    {feature.title}
                  </div>
                  <p
                    style={{
                      margin: '6px 0 0',
                      fontSize: 14,
                      lineHeight: 1.55,
                      color: '#525252',
                      wordBreak: 'keep-all',
                    }}
                  >
                    {feature.body}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Desktop-only exams — the one hard limitation on mobile. */}
          <div
            style={{
              margin: '6px 0 12px',
              borderRadius: 12,
              border: '1px solid #FDE68A',
              background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
              padding: '14px',
              display: 'flex',
              gap: 12,
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: 40,
                height: 40,
                borderRadius: 12,
                background: '#FEF3C7',
                color: '#B45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Monitor style={{ width: 22, height: 22 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#92400E', wordBreak: 'keep-all' }}>
                {labels.pcTitle}
              </div>
              <p
                style={{
                  margin: '6px 0 0',
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: '#78350F',
                  wordBreak: 'keep-all',
                }}
              >
                {labels.pcBody}
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            flexShrink: 0,
            padding: '10px 18px max(16px, env(safe-area-inset-bottom))',
            borderTop: '1px solid #F5F5F5',
          }}
        >
          <button
            type="button"
            onClick={dismiss}
            style={{
              width: '100%',
              height: 52,
              border: 'none',
              borderRadius: 12,
              background: '#191919',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {labels.confirm}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
