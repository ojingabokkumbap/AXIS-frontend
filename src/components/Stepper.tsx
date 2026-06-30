/* ─────────────────────────────────────────────────────────────
   Stepper — 멀티스텝 페이지(시험 준비, 신청 위저드 등) 공용 인디케이터.

   디자인 — 숫자/체크 없는 미니멀 닷 스타일:
     - 활성  : 흰 배경 + 파란 굵은 ring (도넛 모양)
     - 완료  : 솔리드 파란 닷
     - 대기  : 솔리드 회색 닷
     - 라벨은 활성=파란 굵게 / 완료=진한 회색 / 대기=옅은 회색

   사용 예:
     const STEPS: StepperStep[] = [
       { label: '시험정보' }, { label: '시험유의사항' }, ...
     ];
     <Stepper steps={STEPS} currentIndex={1} />
   ───────────────────────────────────────────────────────────── */

export interface StepperStep {
  label: string;
}

interface StepperProps {
  steps: StepperStep[];
  /** 현재 활성 스텝(0-based). 이 인덱스보다 작은 스텝은 완료로 표시됩니다. */
  currentIndex: number;
  className?: string;
}

export function Stepper({ steps, currentIndex, className = '' }: StepperProps) {
  return (
    <div className={`flex items-start w-full ${className}`}>
      {steps.map((step, idx) => {
        const isCompleted = idx < currentIndex;
        const isActive = idx === currentIndex;
        const isFirst = idx === 0;
        const isLast = idx === steps.length - 1;
        return (
          <div key={idx} className="relative flex-1 min-w-0 flex flex-col items-center">
            {!isFirst && (
              <div
                aria-hidden="true"
                className={`absolute left-0 right-1/2 top-[12px] h-[2px] ${
                  isCompleted || isActive ? 'bg-[#2563EB]' : 'bg-[#D4D4D8]'
                }`}
              />
            )}
            {!isLast && (
              <div
                aria-hidden="true"
                className={`absolute left-1/2 right-0 top-[12px] h-[2px] ${
                  isCompleted ? 'bg-[#2563EB]' : 'bg-[#D4D4D8]'
                }`}
              />
            )}
            <div className="relative z-10 flex flex-col items-center">
              <StepDot isCompleted={isCompleted} isActive={isActive} />
              <span
                className={`mt-[clamp(7px,0.6vw,10px)] text-[clamp(13px,1.2vw,32px)] text-center whitespace-nowrap px-2 ${
                  isActive
                    ? 'text-[#2563EB] font-medium'
                    : isCompleted
                    ? 'text-[#737373] font-normal'
                    : 'text-[#9CA3AF] font-normal'
                }`}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StepDot({ isCompleted, isActive }: { isCompleted: boolean; isActive: boolean }) {
  const sizeCls = 'w-[clamp(18px,1.4vw,32px)] h-[clamp(18px,1.4vw,32px)]';
  if (isActive) {
    return (
      <div
        className={`${sizeCls} rounded-full bg-white border-[clamp(3px,0.22vw,5px)] border-[#1D73E8]`}
      />
    );
  }
  if (isCompleted) {
    return <div className={`${sizeCls} rounded-full bg-[#1D73E8]`} />;
  }
  return <div className={`${sizeCls} rounded-full bg-[#D4D4D8]`} />;
}
