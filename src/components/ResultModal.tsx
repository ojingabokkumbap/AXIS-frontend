import { useEffect, type ReactNode } from 'react';

/* ─────────────────────────────────────────────────────────────
   ResultModal — 조회 결과(검색 실패 / 상태 표시 등) 공용 모달
   - <ResultModal title onClose>{children}</ResultModal> 형태로 사용
   - body에는 ResultModalEmpty 또는 ResultModalRows 를 조합
   ───────────────────────────────────────────────────────────── */

const INK_900 = '#191919';
const GRAY_300 = '#737373';
const GRAY_500 = '#525252';

export type ResultModalRow = {
  label: string;
  value: ReactNode;
  valueClass?: string;
};

interface ResultModalInlineTextProps {
  children: ReactNode;
  className?: string;
}

/**
 * 모달 푸터에서 공용으로 사용할 버튼.
 * - variant='default'  : 기본 회색(닫기/확인용)
 * - variant='primary'  : 파랑(주요 액션 — 예: 시험시작)
 * - variant='danger'   : 빨강(파괴적 액션 — 예: 삭제 확정)
 * - variant='success'  : 초록(긍정 액션)
 * 새 색이 필요하면 BUTTON_VARIANTS 맵에만 추가하세요. 모든 호출부의
 * 사이즈/패딩/타이포는 여기서 한 곳에서만 관리합니다.
 */
export type ResultModalButtonVariant = 'default' | 'primary' | 'danger' | 'success';

const BUTTON_VARIANTS: Record<ResultModalButtonVariant, string> = {
  default: 'bg-gray-800 hover:bg-gray-900',
  primary: 'bg-blue-600 hover:bg-blue-700',
  danger: 'bg-red-600 hover:bg-red-700',
  success: 'bg-emerald-600 hover:bg-emerald-700',
};

interface ResultModalButtonProps {
  variant?: ResultModalButtonVariant;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  children: ReactNode;
}

export function ResultModalButton({
  variant = 'default',
  onClick,
  disabled,
  type = 'button',
  children,
}: ResultModalButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full sm:w-auto text-white rounded-md px-10 py-3 text-[16px] sm:text-[18px] font-semibold disabled:opacity-60 transition-colors ${BUTTON_VARIANTS[variant]}`}
    >
      {children}
    </button>
  );
}

interface ResultModalProps {
  title: string;
  /** 헤더 배경색. 기본 blue-600(#2563EB). */
  headerBg?: string;
  onClose: () => void;
  children: ReactNode;
  /** 푸터 영역. 지정하지 않으면 기본 "확인" 버튼이 렌더링됩니다. */
  footer?: ReactNode;
}

export function ResultModal({ title, headerBg = '#2563EB', onClose, children, footer }: ResultModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-1100 flex items-end sm:items-center justify-center p-3 sm:p-6 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-max max-w-[96vw] min-w-[320px] max-h-[min(92dvh,720px)] flex flex-col bg-white rounded-t-2xl sm:rounded-xl overflow-hidden shadow-2xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex shrink-0 items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4"
          style={{ background: headerBg }}
        >
          <h3 className="text-[19px] sm:text-[22px] font-semibold tracking-tight text-white min-w-0 truncate max-w-content-w">
            {title}
          </h3>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-md transition-colors text-white"
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="min-h-full overflow-y-auto max-w-full px-5 py-6 sm:px-8 sm:py-8 text-[16px] sm:text-[20px] leading-[1.7] text-ink">{children}</div>

        {/* Footer */}
        <div
          className="flex shrink-0 justify-center sm:justify-end px-4 py-3 sm:px-6 border-t"
          style={{ borderColor: '#E5E5E5', background: '#FAFAFA' }}
        >
          {footer ?? (
            <ResultModalButton onClick={onClose}>확인</ResultModalButton>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 모달 본문에서 "무조건 한 줄"로 보여야 하는 안내 문구용 텍스트.
 * 작은 화면에서는 가로 스크롤로 잘림을 방지합니다.
 */
export function ResultModalInlineText({ children, className = '' }: ResultModalInlineTextProps) {
  return (
    <p
      className={`w-full min-w-0 whitespace-nowrap text-[16px] sm:text-[20px] leading-[1.7] ${className}`.trim()}
    >
      {children}
    </p>
  );
}

/**
 * 검색 결과 없음 / 빈 상태 컨텐츠.
 * 회색 원형 ! 아이콘 + 메인 메시지 + 보조 텍스트.
//  */
export function ResultModalEmpty({
  message,
  helperText,
}: {
  message: string;
  helperText?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center py-2 sm:py-4">
      <div
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-4 sm:mb-6"
        style={{ background: '#E5E7EB' }}
      >
        <span
          className="text-[32px] sm:text-[40px] font-semibold leading-none"
          style={{ color: '#9CA3AF' }}
        >
          !
        </span>
      </div>
      <p className="text-[17px] sm:text-[20px] leading-relaxed px-1" style={{ color: GRAY_500 }}>
        {message}
      </p>
      {helperText && (
        <p className="text-[15px] sm:text-[17px] mt-2 leading-relaxed px-1" style={{ color: GRAY_300 }}>
          {helperText}
        </p>
      )}
    </div>
  );
}

/**
 * 데이터 표시(상태 + 라벨/값 목록) 컨텐츠.
 */
export function ResultModalRows({
  description,
  descriptionColor,
  rows,
}: {
  description?: ReactNode;
  /** description 텍스트 색상. 기본 INK_900. */
  descriptionColor?: string;
  rows: ResultModalRow[];
}) {
  return (
    <>
      {description && (
        <p
          className="text-[16px] sm:text-[18px] leading-[1.7] mb-4"
          style={{ color: descriptionColor ?? INK_900 }}
        >
          {description}
        </p>
      )}
      {rows.length > 0 && (
        <div
          className="flex flex-col sm:grid sm:grid-cols-[minmax(96px,120px)_1fr] sm:gap-y-2.5 sm:gap-x-3 text-[16px] sm:text-[18px] p-3 sm:p-5 rounded-xl border"
          style={{ background: '#FAFAFA', borderColor: '#E5E5E5' }}
        >
          {rows.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-1 gap-1 py-3 border-b border-[#E5E5E5] last:border-b-0 sm:contents sm:py-0 sm:border-0"
            >
              <span className="text-[14px] sm:text-[15px] font-semibold sm:font-normal" style={{ color: GRAY_300 }}>
                {r.label}
              </span>
              <span className={`${r.valueClass ?? ''} break-words`} style={{ color: INK_900 }}>
                {r.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
