/* ─────────────────────────────────────────────────────────────
   PageTabs — 상세 페이지 공통 sticky 탭 (pill 스타일)
   ───────────────────────────────────────────────────────────── */
interface Tab<K extends string> {
  key: K;
  label: string;
}

interface Props<K extends string> {
  tabs: ReadonlyArray<Tab<K>>;
  active: K;
  onChange: (key: K) => void;
  /** 헤더 높이 (80px)에 부착되도록 기본 top-20 */
  stickyOffsetClass?: string;
}

const INK_900 = '#191919';
const GRAY_300 = '#737373';

const BORDER = '#E5E5E5';

export function PageTabs<K extends string>({ tabs, active, onChange, stickyOffsetClass = 'top-[80px]' }: Props<K>) {
  return (
    <nav
      className={`sticky ${stickyOffsetClass} z-40 bg-white/95 backdrop-blur-sm overflow-visible`}
      style={{ borderBottom: `1px solid ${BORDER}` }}
    >
      <div
        className="mx-auto flex items-center gap-2 sm:gap-3 lg:gap-5 px-4 sm:px-6 lg:px-10 py-3 overflow-x-auto overflow-y-visible [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ maxWidth: 1280 }}
      >
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              data-tab={tab.key}
              onClick={() => onChange(tab.key)}
              className="inline-flex items-center h-10 sm:h-11 px-4 sm:px-5 text-[15px] sm:text-[16px] lg:text-[17px] font-semibold transition-all cursor-pointer shrink-0"
              style={{
                color: isActive ? INK_900 : GRAY_300,
                border: isActive ? `1.5px solid ${INK_900}` : '1.5px solid transparent',
                borderRadius: 9999,
                background: 'transparent',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default PageTabs;
