import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '@/i18n';
import { GUIDE_MASCOT_POSTER, GUIDE_MASCOT_SRC, waitForAnchor } from './guideTour';
import { useTour } from './TourProvider';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const TIP_W = 320;
const TIP_H_EST = 210; // 말풍선 예상 높이 (위치 클램프용)
const GAP = 14; // 하이라이트와 말풍선 사이 간격

/** rect + 선호 placement 로 말풍선 좌표를 계산하고 뷰포트 안으로 클램프한다. */
function computeTipPos(rect: Rect, placement: 'top' | 'bottom' | 'left' | 'right') {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const spaceBelow = vh - rect.top - rect.height;
  const spaceAbove = rect.top;
  const spaceRight = vw - rect.left - rect.width;
  const spaceLeft = rect.left;

  let place = placement;
  if (place === 'bottom' && spaceBelow < TIP_H_EST + GAP && spaceAbove > spaceBelow) place = 'top';
  else if (place === 'top' && spaceAbove < TIP_H_EST + GAP && spaceBelow > spaceAbove) place = 'bottom';
  else if (place === 'right' && spaceRight < TIP_W + GAP && spaceLeft > spaceRight) place = 'left';
  else if (place === 'left' && spaceLeft < TIP_W + GAP && spaceRight > spaceLeft) place = 'right';

  let top: number;
  let left: number;
  switch (place) {
    case 'top':
      top = rect.top - TIP_H_EST - GAP;
      left = cx - TIP_W / 2;
      break;
    case 'left':
      top = cy - TIP_H_EST / 2;
      left = rect.left - TIP_W - GAP;
      break;
    case 'right':
      top = cy - TIP_H_EST / 2;
      left = rect.left + rect.width + GAP;
      break;
    case 'bottom':
    default:
      top = rect.top + rect.height + GAP;
      left = cx - TIP_W / 2;
      break;
  }

  left = Math.max(12, Math.min(left, vw - TIP_W - 12));
  top = Math.max(12, Math.min(top, vh - TIP_H_EST - 12));
  return { top, left };
}

export function TourOverlay() {
  const { t } = useI18n();
  const { status, step, stepIndex, steps, next, prev, stop } = useTour();

  // 측정 결과를 스텝 id 와 함께 보관해, 스텝이 바뀌면 자동으로 무효화되게 한다.
  // (이렇게 하면 effect 안에서 동기적으로 setState(null) 로 리셋할 필요가 없다)
  const [measured, setMeasured] = useState<{ id: string; rect: Rect } | null>(null);

  const anchor = step?.anchor ?? null;
  const stepId = step?.id ?? null;
  const padding = step?.padding ?? 8;

  // 앵커 요소를 찾아 위치를 잰다. 라우트 이동/데이터 로딩으로 늦게 mount 될 수 있어
  // waitForAnchor 로 기다린다. timeout 내 못 찾으면 다음 스텝으로 건너뛴다.
  useEffect(() => {
    if (status !== 'running' || !anchor || !stepId) return;
    const controller = new AbortController();
    let raf = 0;
    let el: HTMLElement | null = null;

    const measure = () => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      setMeasured({
        id: stepId,
        rect: {
          top: r.top - padding,
          left: r.left - padding,
          width: r.width + padding * 2,
          height: r.height + padding * 2,
        },
      });
    };

    const onScrollResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    waitForAnchor(anchor, { signal: controller.signal }).then((found) => {
      if (controller.signal.aborted) return;
      if (!found) {
        // 앵커가 없는 페이지/뷰포트 → 조용히 다음 스텝으로
        next();
        return;
      }
      el = found;
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      // 스크롤 애니메이션이 끝난 뒤 위치가 안정되도록 약간 지연 후 재측정
      raf = requestAnimationFrame(() => {
        measure();
        setTimeout(measure, 320);
      });
      window.addEventListener('scroll', onScrollResize, true);
      window.addEventListener('resize', onScrollResize);
    });

    return () => {
      controller.abort();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScrollResize, true);
      window.removeEventListener('resize', onScrollResize);
    };
    // padding 은 step 에 종속되므로 anchor/stepId 로 충분
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, anchor, stepId]);

  if (status !== 'running' || !step) return null;

  // 현재 스텝에 대해 측정된 rect 만 사용 (스텝 전환 중 이전 rect 는 무시)
  const rect = measured && measured.id === step.id ? measured.rect : null;
  const tipPos = rect ? computeTipPos(rect, step.placement ?? 'bottom') : null;
  const isLast = stepIndex >= steps.length - 1;

  return createPortal(
    <div className="fixed inset-0 z-[2500]" role="dialog" aria-modal="true" aria-live="polite">
      {/* 딤 + 컷아웃 (SVG 마스크) */}
      <svg className="absolute inset-0 h-full w-full" style={{ pointerEvents: 'none' }}>
        <defs>
          <mask id="axis-guide-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left}
                y={rect.top}
                width={rect.width}
                height={rect.height}
                rx={12}
                ry={12}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15,23,42,0.62)"
          mask="url(#axis-guide-mask)"
        />
      </svg>

      {/* 바깥 영역 클릭 차단 (실수로 페이지가 눌리지 않게) */}
      <div className="absolute inset-0" style={{ pointerEvents: 'auto' }} onClick={() => stop()} />

      {/* 스포트라이트 테두리 링 */}
      {rect && (
        <div
          className="pointer-events-none absolute rounded-xl transition-all duration-200"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow: '0 0 0 2px #3b82f6, 0 0 0 6px rgba(59,130,246,0.28)',
          }}
        />
      )}

      {/* 말풍선 카드 */}
      <div
        className="absolute rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        style={{
          width: TIP_W,
          top: tipPos?.top ?? -9999,
          left: tipPos?.left ?? -9999,
          opacity: tipPos ? 1 : 0,
          pointerEvents: 'auto',
          transition: 'opacity 160ms ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 p-4 pb-3">
          <video
            src={GUIDE_MASCOT_SRC}
            poster={GUIDE_MASCOT_POSTER}
            muted
            loop
            autoPlay
            playsInline
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-black/10"
            style={{ objectPosition: 'center 20%' }}
          />
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold leading-snug text-[#191919] break-keep">
              {t(step.titleKey)}
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-[#525252] break-keep">
              {t(step.bodyKey)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-black/5 px-4 py-2.5">
          {/* 진행 점 */}
          <div className="flex items-center gap-1.5">
            {steps.map((s, i) => (
              <span
                key={s.id}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === stepIndex ? 16 : 6,
                  background: i === stepIndex ? '#3b82f6' : '#D4D4D8',
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => stop()}
              className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[#737373] hover:bg-black/[0.04]"
            >
              {t('guide.tour.skip')}
            </button>
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={() => prev()}
                className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-[#1F1F1F] ring-1 ring-black/10 hover:bg-black/[0.03]"
              >
                {t('guide.tour.prev')}
              </button>
            )}
            <button
              type="button"
              onClick={() => (isLast ? stop({ completed: true }) : next())}
              className="rounded-lg bg-[#3b82f6] px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-[#2f6fe0]"
            >
              {isLast ? t('guide.tour.done') : t('guide.tour.next')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
