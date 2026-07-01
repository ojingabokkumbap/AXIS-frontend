import { Compass } from 'lucide-react';
import { useIsMobile } from '@/lib/useIsMobile';

interface Props {
  label: string;
  onReplay: () => void;
  /** Distance from viewport bottom — raise on pages with a fixed footer (exam runner). */
  bottomOffset?: number;
}

/**
 * Floating site guide — replays the current page tour. Fixed to the bottom-right
 * corner. Hidden during active tours. After the auto-show budget runs out, this
 * is the user's permanent way back into the tutorial.
 *
 * On phones the full "Site guide" pill covers full-width primary buttons (e.g.
 * the pay CTA), so we collapse it to a compact icon-only circle there.
 */
export function TourHelpFab({ label, onReplay, bottomOffset = 20 }: Props) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <button
        type="button"
        data-tour="site-guide-fab"
        onClick={onReplay}
        aria-label={label}
        title={label}
        style={{
          position: 'fixed',
          right: 16,
          bottom: bottomOffset,
          zIndex: 900,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '1px solid #E5E5E5',
          background: '#191919',
          color: '#fff',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
          cursor: 'pointer',
        }}
      >
        <Compass style={{ width: 20, height: 20 }} />
      </button>
    );
  }

  return (
    <button
      type="button"
      data-tour="site-guide-fab"
      onClick={onReplay}
      aria-label={label}
      title={label}
      style={{
        position: 'fixed',
        right: 16,
        bottom: bottomOffset,
        zIndex: 900,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height: 48,
        padding: '0 16px 0 14px',
        borderRadius: 999,
        border: '1px solid #E5E5E5',
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        color: '#191919',
        fontSize: 14,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'var(--font-sans, inherit)',
        transition: 'transform 150ms ease, box-shadow 150ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translate(-2px, -2px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.14)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)';
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#191919',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Compass style={{ width: 16, height: 16 }} />
      </span>
      {label}
    </button>
  );
}
