/**
 * First-visit journey modal — explains Register → My Page → Demo → Real exam.
 */
import { createPortal } from 'react-dom';
import { BookOpen, ClipboardList, FlaskConical, ShieldCheck, X } from 'lucide-react';
import { markTourDone, TOUR_KEYS } from './onboardingStorage';

interface Props {
  open: boolean;
  labels: {
    title: string;
    subtitle: string;
    step1Title: string;
    step1Body: string;
    step2Title: string;
    step2Body: string;
    step3Title: string;
    step3Body: string;
    step4Title: string;
    step4Body: string;
    demoBadge: string;
    realBadge: string;
    startTour: string;
    skip: string;
  };
  onStartTour: () => void;
  onClose: () => void;
}

const STEPS = [
  { icon: ClipboardList, tone: '#2563EB', bg: '#EFF6FF' },
  { icon: BookOpen, tone: '#191919', bg: '#F5F5F7' },
  { icon: FlaskConical, tone: '#16A34A', bg: '#F0FDF4' },
  { icon: ShieldCheck, tone: '#7C3AED', bg: '#F5F3FF' },
] as const;

export function JourneyWelcomeModal({ open, labels, onStartTour, onClose }: Props) {
  if (!open) return null;

  const stepContent = [
    { title: labels.step1Title, body: labels.step1Body, badge: labels.realBadge },
    { title: labels.step2Title, body: labels.step2Body, badge: labels.realBadge },
    { title: labels.step3Title, body: labels.step3Body, badge: labels.demoBadge },
    { title: labels.step4Title, body: labels.step4Body, badge: labels.realBadge },
  ];

  const dismiss = () => {
    markTourDone(TOUR_KEYS.journey);
    onClose();
  };

  const start = () => {
    markTourDone(TOUR_KEYS.journey);
    onStartTour();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="journey-welcome-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: 'rgba(15, 18, 28, 0.55)',
        backdropFilter: 'blur(6px)',
        fontFamily: 'var(--font-sans, ui-sans-serif, "Noto Sans KR", sans-serif)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          background: '#FFFFFF',
          borderRadius: 24,
          boxShadow: '0 40px 100px rgba(0,0,0,0.22)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '28px 28px 20px',
            background: 'linear-gradient(135deg, #191919 0%, #2d3748 100%)',
            color: '#fff',
            position: 'relative',
          }}
        >
          <button
            type="button"
            onClick={dismiss}
            aria-label={labels.skip}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              border: 'none',
              background: 'rgba(255,255,255,0.12)',
              color: '#fff',
              width: 32,
              height: 32,
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
            AXIS Guide
          </div>
          <h2 id="journey-welcome-title" style={{ margin: '8px 0 0', fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.25 }}>
            {labels.title}
          </h2>
          <p style={{ margin: '10px 0 0', fontSize: 15, lineHeight: 1.6, color: 'rgba(255,255,255,0.82)' }}>
            {labels.subtitle}
          </p>
        </div>

        <div style={{ padding: '8px 24px 24px' }}>
          {stepContent.map((step, i) => {
            const meta = STEPS[i];
            const Icon = meta.icon;
            return (
              <div
                key={step.title}
                style={{
                  display: 'flex',
                  gap: 14,
                  padding: '16px 0',
                  borderBottom: i < stepContent.length - 1 ? '1px solid #F0F0F0' : 'none',
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 44,
                    height: 44,
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#737373' }}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#191919' }}>{step.title}</span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: step.badge === labels.demoBadge ? '#F0FDF4' : '#EFF6FF',
                        color: step.badge === labels.demoBadge ? '#15803D' : '#2563EB',
                      }}
                    >
                      {step.badge}
                    </span>
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.55, color: '#525252' }}>{step.body}</p>
                </div>
              </div>
            );
          })}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={start}
              style={{
                width: '100%',
                height: 48,
                border: 'none',
                borderRadius: 12,
                background: '#191919',
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {labels.startTour}
            </button>
            <button
              type="button"
              onClick={dismiss}
              style={{
                width: '100%',
                height: 44,
                border: 'none',
                background: 'transparent',
                color: '#737373',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {labels.skip}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
