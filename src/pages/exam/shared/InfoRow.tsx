import type { ReactNode } from 'react';
import { EXAM } from './tokens';

/* ─────────────────────────────────────────────────────────────
   InfoRow — exam 흐름에서 "라벨: 값" 형태로 정보를 나열할 때 쓰는 공용 카드 row.
   - 카드형 디자인(EXAM.surface.card)
   - 라벨/값 사이즈는 EXAM.text.label / EXAM.text.value 토큰을 사용
   - 여러 개를 `<div className="space-y-3">` 등으로 감싸서 사용

   사용 예:
     <div className="space-y-3 sm:space-y-3.5">
       <InfoRow label="시험명" value="AXIS-C L3 Starter" />
       <InfoRow label="시험시간" value="40분" />
     </div>
   ───────────────────────────────────────────────────────────── */

interface InfoRowProps {
  label: string;
  value: ReactNode;
  /** 라벨 컬럼 너비. 기본 모바일 110px / 데스크탑 150px. */
  labelWidth?: string;
}

export function InfoRow({ label, value, labelWidth }: InfoRowProps) {
  return (
    <div className={`flex items-center ${EXAM.surface.card} ${EXAM.layout.cardPaddingX} ${EXAM.layout.cardPaddingY}`}>
      <span className={`${EXAM.text.label} ${EXAM.color.muted} shrink-0 ${labelWidth ?? 'w-[clamp(110px,9vw,220px)]'}`}>
        {label}
      </span>
      <span className={`${EXAM.text.value} ${EXAM.color.ink}`}>{value}</span>
    </div>
  );
}
