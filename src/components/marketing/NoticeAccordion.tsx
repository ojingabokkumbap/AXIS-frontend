import type { NoticeItem } from '@/services/api';

const INK_900 = '#191919';
const GRAY_500 = '#525252';
const GRAY_300 = '#737373';
const BORDER_LIGHT = '#E5E7EB';

function formatNoticeDate(iso: string): string {
  return new Date(iso)
    .toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
    .replace(/\. /g, '.')
    .replace(/\.$/, '');
}

function NoticeChevron({ open }: { open: boolean }) {
  return (
    <span
      className="shrink-0 inline-flex items-center justify-center"
      style={{ width: 28, height: 28, color: open ? INK_900 : GRAY_300 }}
      aria-hidden="true"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <line
          x1="12"
          y1="5"
          x2="12"
          y2="19"
          style={{
            transformOrigin: '12px 12px',
            transform: open ? 'scaleY(0)' : 'scaleY(1)',
            transition: 'transform .3s cubic-bezier(.16,1,.3,1)',
          }}
        />
      </svg>
    </span>
  );
}

interface NoticeAccordionProps {
  notices: NoticeItem[];
  openIds: Set<string>;
  onToggle: (id: string) => void;
  variant?: 'home' | 'qna';
}

export function NoticeAccordion({
  notices,
  openIds,
  onToggle,
  variant = 'home',
}: NoticeAccordionProps) {
  if (notices.length === 0) return null;

  const isHome = variant === 'home';

  return (
    <div className={isHome ? 'overflow-hidden' : undefined} style={isHome ? { background: '#FFFFFF' } : undefined}>
      {notices.map((n, idx) => {
        const isOpen = openIds.has(n.id);
        const tagBg = n.tagType === 'IMPORTANT' ? 'rgba(237,101,101,0.1)' : 'rgba(59,130,246,0.1)';
        const tagColor = n.tagType === 'IMPORTANT' ? '#ed6565' : '#3b82f6';

        return (
          <div
            key={n.id}
            style={{
              borderTop: isHome
                ? idx === 0
                  ? '2px solid #1B1B1B'
                  : '1px solid #1B1B1B'
                : undefined,
              borderBottom: isHome ? undefined : `1px solid ${BORDER_LIGHT}`,
            }}
          >
            <button
              type="button"
              onClick={() => onToggle(n.id)}
              className={[
                'w-full text-left bg-transparent border-none cursor-pointer',
                isHome
                  ? 'flex flex-wrap items-center gap-x-5 gap-y-3 px-6 lg:px-8 py-5 lg:py-8 reveal'
                  : 'flex items-center gap-4 py-5 lg:py-6 group',
              ].join(' ')}
              aria-expanded={isOpen}
            >
              <span
                className="text-[14px] lg:text-[15px] font-semibold shrink-0 px-3 py-1.5 rounded-full"
                style={{ background: tagBg, color: tagColor }}
              >
                {n.tag}
              </span>
              <span
                className={[
                  'flex-1 min-w-0 font-semibold transition-colors',
                  isHome
                    ? 'text-[19px] lg:text-[22px] leading-[1.3] tracking-[-0.015em]'
                    : 'text-[17px] lg:text-[19px] leading-[1.4]',
                ].join(' ')}
                style={{ color: INK_900 }}
              >
                {n.title}
              </span>
              <span className="shrink-0 text-[14px] lg:text-[15px]" style={{ color: GRAY_300 }}>
                {formatNoticeDate(n.createdAt)}
              </span>
              <NoticeChevron open={isOpen} />
            </button>

            <div
              className="overflow-hidden"
              style={{
                maxHeight: isOpen ? 2400 : 0,
                opacity: isOpen ? 1 : 0,
                transition: 'max-height .4s cubic-bezier(.16,1,.3,1), opacity .25s ease',
              }}
            >
              <div
                className={[
                  'whitespace-pre-wrap break-words',
                  isHome
                    ? 'px-6 lg:px-8 pb-6 lg:pb-8 text-[15px] lg:text-[17px] leading-[1.75] tracking-[-0.005em]'
                    : 'pb-6 lg:pb-8 text-[16px] lg:text-[18px] leading-[1.85] tracking-[-0.005em]',
                ].join(' ')}
                style={{ color: GRAY_500, paddingLeft: isHome ? undefined : 0 }}
              >
                {n.content.trim() || '—'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
