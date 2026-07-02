import { H_SEC, T_SUB, INK_900, GRAY_500 } from '@/pages/apply/lib/applyTokens';

interface Props {
  title: string;
  sub?: string;
  divider?: boolean;
  /** 하단 마진 클래스 (기본 mb-6) */
  bottomGap?: string;
}

/**
 * /apply 모든 step의 섹션 헤더 공용 컴포넌트.
 * - 큰 타이틀(H_SEC) + 보조설명(T_SUB) + 하단 디바이더 라인.
 * - 사이즈/색상/스페이싱은 applyTokens.ts에서 일괄 관리.
 */
export function ApplySectionHeader({
  title,
  sub,
  bottomGap = 'mb-6',
}: Props) {
  return (
    <div className={`${bottomGap} flex w-full flex-col items-start gap-1 sm:flex-row sm:place-content-between sm:items-end sm:gap-0 border-b-[2px] pb-4 sm:pb-5`} style={{ borderColor: '#272727' }}>
      <h2 className={`${H_SEC} break-keep`} style={{ color: INK_900 }}>
        {title}
      </h2>
      {sub && (
        <p className={`${T_SUB} mt-1 sm:mt-2 break-keep`} style={{ color: GRAY_500 }}>
          {sub}
        </p>
      )}
    </div>
  );
}
