/* ─────────────────────────────────────────────────────────────
   EXAM 디자인 토큰 (Single Source of Truth)

   exam 폴더 전체에서 폰트 사이즈/색/카드 스타일을 한 곳에서 관리합니다.
   여기 값을 한 번 바꾸면 모든 exam 페이지에 일괄 반영됩니다.

   ※ 핵심 원칙: CBT는 전체화면(fullscreen)으로 실행됩니다.
     모니터 크기가 1366px ~ 4K(3840px)까지 다양하므로 모든 사이즈는
     clamp(최소, vw기반, 최대)로 정의해서 화면이 커지면 자동으로 같은
     비율로 커지도록 설계되었습니다.

     예: clamp(16px, 1.2vw, 28px) →
       - 1024px 화면: 16px (최소값에 걸림)
       - 1920px 화면: 23px (1.2vw 적용)
       - 3840px 화면: 28px (최대값에 걸림)

     min/max를 너무 좁히면 큰 화면에서 작아 보이고, 너무 넓히면
     작은 화면에서 깨지니까 vw 슬로프와 max를 같이 조정하세요.

   사용 예:
     import { EXAM } from '@/pages/exam/shared';

     <h2 className={`${EXAM.text.sectionTitle} ${EXAM.color.ink} mb-7`}>
       시험정보
     </h2>
     <div className={EXAM.surface.card}>...</div>
   ───────────────────────────────────────────────────────────── */

export const EXAM = {
  /**
   * Typography presets. clamp(min, fluid, max) 형태로 화면 크기에 비례.
   * 색은 EXAM.color에서, 마진은 사용처에서 추가.
   */
  text: {
    /** 헤더 좌측 페이지 타이틀 ("시험 전 안내사항", "본인 인증" 등) */
    pageTitle: 'text-[clamp(30px,1.75vw,65px)] font-bold tracking-tight',
    /** 스텝 본문 상단의 섹션 H2 */
    sectionTitle: 'text-[clamp(28px,2vw,60px)] font-bold',
    /** 카드 안쪽 헤딩 (h3) */
    cardHeading: 'text-[clamp(18px,1.3vw,34px)] font-semibold',
    /** 정보 카드의 라벨 컬럼 (옅은 회색) */
    label: 'text-[clamp(16px,1.15vw,28px)] font-medium',
    /** 정보 카드의 값 (강조) */
    value: 'text-[clamp(18px,1.4vw,34px)] font-semibold',
    /** 본문 일반 텍스트 */
    body: 'text-[clamp(16px,1.15vw,28px)] leading-relaxed',
    /** 본문 내 작은 텍스트 (디테일 한 줄 안내) */
    bodySm: 'text-[clamp(14px,1.0vw,22px)]',
    /** 보조 안내 / 헬프 텍스트 */
    helper: 'text-[clamp(14px,1.0vw,22px)]',
    /** 작은 캡션 / 메타 */
    caption: 'text-[clamp(15px,1.2vw,25px)]',
    /** 큰 액션 버튼 (이전/다음 같은 네비게이션) */
    buttonLg: 'text-[clamp(17px,1.35vw,32px)] font-semibold',
    /** 보통 액션 버튼 (다시 점검 등) */
    button: 'text-[clamp(14px,1.0vw,22px)] font-medium',
    /** 상태 pill 작은 텍스트 (PASS/FAIL 등) */
    pill: 'text-[clamp(12px,0.85vw,18px)] font-medium',
  },

  /**
   * 색 토큰. text-XXX 형태로 바로 className에 끼워 쓸 수 있는 Tailwind 유틸리티.
   */
  color: {
    /* 아래 색들은 CBT 러너 다크모드를 위해 var(--exam-*) 기반.
       fallback(쉼표 뒤 hex)은 .exam-root 밖(다른 exam 페이지)에서 그대로 라이트로
       렌더되도록 보장 — 즉 러너 외 페이지는 출력이 바뀌지 않는다. */
    /** 가장 진한 본문 텍스트 */
    ink: 'text-[var(--exam-text,#0F172A)]',
    /** 본문 보통 (slate-600) */
    body: 'text-[var(--exam-text-body,#475569)]',
    /** 라벨 / 옅은 텍스트 (slate-500) */
    muted: 'text-[var(--exam-text-muted,#64748B)]',
    /** 헬프 / placeholder 톤 (gray-500) */
    helper: 'text-[var(--exam-text-helper,#6B7280)]',
    /** 브랜드 파랑 */
    brand: 'text-[var(--exam-accent,#2563EB)]',
    /** 경고 (amber) */
    warning: 'text-[#A16207]',
    /** 성공 (green) */
    success: 'text-[#16A34A]',
    /** 위험 (red) */
    danger: 'text-status-danger',
  },

  /**
   * 카드/박스 표면 스타일. bg + border + radius를 한 번에.
   * 패딩/마진은 사용처에서 추가하세요(카드마다 다를 수 있으니까).
   */
  surface: {
    /** 기본 흰 카드 (러너에선 다크 표면으로 전환) */
    card: 'bg-[var(--exam-surface,#fff)] border border-[var(--exam-border,#E5E7EB)] rounded-xl',
    /** 경고(노랑) 박스 */
    warningBox: 'bg-[#FFFBEB] border border-[#FDE68A] rounded-xl',
    /** 성공(초록) 박스 */
    successBox: 'bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl',
    /** 위험(빨강) 박스 */
    dangerBox: 'bg-[#FEE2E2] border border-[#FECACA] rounded-xl',
    /** 정보(파랑) 박스 */
    infoBox: 'bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl',
  },

  /**
   * 큰 액션 버튼(이전/다음) 공통 스타일.
   * 폭/높이도 clamp()로 화면 크기에 비례.
   */
  button: {
    /** 큰 primary (파랑 채움) */
    primaryLg:
      'w-[clamp(132px,10vw,260px)] h-[clamp(48px,3.8vw,84px)] rounded-md font-semibold bg-[var(--exam-accent,#2563EB)] text-white hover:bg-[var(--exam-accent-hover,#1D4ED8)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors',
    /** 큰 outline (흰 배경 + 보더) */
    outlineLg:
      'w-[clamp(132px,10vw,260px)] h-[clamp(48px,3.8vw,84px)] rounded-md font-semibold border border-[var(--exam-border,#E5E7EB)] bg-[var(--exam-surface,#fff)] text-[var(--exam-text,#0F172A)] hover:bg-[var(--exam-surface-2,#F8FAFC)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
  },

  /**
   * 레이아웃 유틸. 컨테이너 max-width, 섹션 패딩 등 화면 크기에 비례하는 것들.
   */
  layout: {
    /**
     * 본문 컨테이너의 max-width. 화면 너비의 65%를 기본으로 하되 최소
     * 720px(작은 데스크탑), 최대 2200px(4K에서도 양쪽 여백 자연스럽게).
     */
    container: 'max-w-[clamp(720px,65vw,2200px)] mx-auto',
    /**
     * 본문 컨테이너의 좌우 padding. 화면이 클수록 더 넓게.
     */
    containerPx: 'px-[clamp(16px,2vw,48px)]',
    /**
     * 본문 컨테이너의 상하 padding. CBT 전체화면에서 스크롤 없이 한 화면에
     * 들어가야 하므로 작게 유지.
     */
    containerPy: 'py-[clamp(16px,1.4vw,40px)]',
    /**
     * 카드 안쪽 padding.
     */
    cardPadding: 'p-[clamp(20px,1.8vw,48px)]',
    /**
     * 카드 안쪽 padding — 가로/세로 분리(InfoRow 같은 가로형 카드용).
     */
    cardPaddingX: 'px-[clamp(20px,2vw,52px)]',
    cardPaddingY: 'py-[clamp(16px,1.4vw,36px)]',
  },
} as const;
