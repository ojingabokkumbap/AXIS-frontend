import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { GUIDE_MASCOT_POSTER, GUIDE_MASCOT_SRC, shouldShowGuideWidget } from './guideTour';
import { useTour } from './TourProvider';

/**
 * 우측하단에 상시 떠 있는 마스코트 위젯.
 * 클릭하면 챗봇형 미니 팝오버가 뜨고, 거기서 사이트 둘러보기(투어)를 시작한다.
 */
export function GuideWidget() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const { status, start, seen } = useTour();

  const [open, setOpen] = useState(false);
  // 첫 방문(아직 가이드를 안 본 경우) 살짝 말풍선으로 눈길을 끈다.
  const [hintDismissed, setHintDismissed] = useState(false);

  // 투어 진행 중에는 오버레이가 화면을 덮으므로 위젯/팝오버를 숨긴다.
  // (handleStart 에서 이미 open=false 로 접고 시작하므로 별도 effect 불필요)
  if (status === 'running' || !shouldShowGuideWidget(pathname)) return null;

  // 팝오버가 닫혀 있고, 이번 세션에서 닫지 않았다면 말풍선 힌트를 노출.
  // (seen 여부와 무관하게 보이도록 — 필요하면 `!seen &&` 를 앞에 다시 붙여 첫 방문만 노출 가능)
  const showHint = !hintDismissed && !open;

  const handleStart = () => {
    setOpen(false);
    setHintDismissed(true);
    start();
  };

  return (
    <div
      className="fixed z-[1200] flex flex-col items-end gap-2.5"
      style={{
        right: 'max(1.25rem, env(safe-area-inset-right))',
        bottom: 'max(1.25rem, env(safe-area-inset-bottom))',
      }}
    >
      <style>{`
        @keyframes axis-guide-pop {
          0%   { opacity: 0; transform: translateY(16px) scale(0.4); }
          70%  { opacity: 1; transform: translateY(0)    scale(1.12); }
          100% { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>

      {/* ── 미니 팝오버 (챗봇형 인사) ── */}
      {open && (
        <div className="w-[300px] max-w-[86vw] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <div className="flex items-center gap-3 bg-white px-4 py-3">
            <span className="text-[14px] font-semibold text-[#191919]">
              {t('guide.popover.title')}
            </span>
            <button
              type="button"
              aria-label={t('common.close')}
              onClick={() => setOpen(false)}
              className="ml-auto grid h-7 w-7 place-items-center rounded-full text-[#737373] hover:bg-black/[0.05]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="px-4 py-4">
            <p className="whitespace-pre-line text-[13px] leading-relaxed text-[#525252] break-keep">
              {t('guide.popover.greeting')}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handleStart}
                className="flex-1 rounded-xl bg-[#3b82f6] px-3 py-2.5 text-[13px] font-semibold text-white hover:bg-[#2f6fe0]"
              >
                {t('guide.popover.start')}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-[13px] font-medium text-[#737373] hover:bg-black/[0.04]"
              >
                {t('guide.popover.later')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 첫 방문 힌트 말풍선 ── */}
      {showHint && (
        <button
          key={`hint-${pathname}`}
          type="button"
          onClick={() => setOpen(true)}
          style={{ animation: 'axis-guide-pop 500ms cubic-bezier(0.34,1.56,0.64,1) 460ms both' }}
          className="group relative rounded-full bg-blue-500 px-3.5 py-2 text-[12.5px] font-medium text-white shadow-lg"
        >
          {t('guide.widget.hint')}
          <span
            aria-hidden
            className="absolute -bottom-1 right-6 h-2.5 w-2.5 rotate-45 bg-blue-500"
          />
        </button>
      )}

      {/* ── 마스코트 동그란 버튼 (상시 노출) ──
          key={pathname} 로 라우트가 바뀔 때마다 래퍼가 리마운트되어 등장 애니메이션이 재생된다.
          (등장 애니메이션은 래퍼가, hover 리프트는 버튼이 담당 — transform 충돌 방지) */}
      <div
        key={`orb-${pathname}`}
        style={{ animation: 'axis-guide-pop 560ms cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        <button
          type="button"
          aria-label={t('guide.widget.aria')}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="group relative grid h-[95px] w-[95px] place-items-center overflow-hidden rounded-full bg-white shadow-xl ring-1 ring-black/10 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-2xl"
        >
          <video
            src={GUIDE_MASCOT_SRC}
            poster={GUIDE_MASCOT_POSTER}
            muted
            loop
            autoPlay
            playsInline
            className="h-full w-full object-cover"
            style={{ transform: 'scale(1)', transformOrigin: 'center 0%' }}
          />
          {/* 첫 방문 시 주목 유도용 은은한 링 */}
          {!seen && (
            <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-[#3b82f6]/60 animate-pulse" />
          )}
        </button>
      </div>
    </div>
  );
}
