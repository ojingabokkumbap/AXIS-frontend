/* ─────────────────────────────────────────────────────────────
   /apply 페이지 공통 디자인 토큰
   - 사이즈/색상을 여기서 한 번에 관리
   - 각 step은 이 토큰을 import해서 사용
   ───────────────────────────────────────────────────────────── */

/* Colors — 거의 블랙에 가까운 톤 */
export const INK_900 = '#000000';   /* 제목 / 강조 — 순수 블랙 */
export const INK_700 = '#0A0A0A';   /* 강조 본문 */
export const GRAY_500 = '#1F1F1F';  /* 본문 — 진한 검정 */
export const GRAY_300 = '#3A3A3A';  /* 메타 / 부가 */
export const BORDER = '#E5E5E5';

export const SURFACE_ALT = '#F8FAFC';
export const ACCENT = '#2563EB';
export const DANGER = '#EF4444';
export const SUCCESS = '#16A34A';

/* Typography — ApplySidebar 기준 컴팩트 스케일 */
/* 섹션 제목 (h2) — 22 → lg 26, extrabold black */
export const H_SEC = 'text-[22px] lg:text-[26px] font-semibold leading-[1.2] tracking-[-0.025em]';

/* 카드 / sub-section 제목 (h3) — 15 → lg 16 */
export const H_CARD = 'text-[15px] lg:text-[18px] font-semibold leading-[1.3] tracking-[-0.01em]';

/* 본문 / 카드 설명 — 13 → lg 14 */
export const T_BODY = 'text-[13px] lg:text-[14px] leading-[1.6]';

/* 보조 / 부제 — 13 → lg 14 (color는 GRAY_500 권장) */
export const T_SUB = 'text-[13px] lg:text-[14px] leading-[1.6]';

/* 폼 라벨 — 12 → lg 13 */
export const T_LABEL = 'text-[12px] lg:text-[13px] font-medium';

/* 입력 필드 텍스트 — 14 → lg 15 */
export const T_INPUT = 'text-[14px] lg:text-[15px]';

/* 메타 / 작은 안내 — 12 */
export const T_META = 'text-[14px] leading-[1.5]';

/* 강조 가격 / 큰 숫자 — 18 → lg 20 */
export const T_PRICE = 'text-[18px] lg:text-[20px] font-bold';
