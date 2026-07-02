import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '@/i18n';

export const MYPAGE_PRINT_LAYER_ID = 'mypage-print-layer';

export function MyPageModal({
  open,
  title,
  onClose,
  children,
  printable = false,
  footer,
  width = 'md',
}: {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  printable?: boolean;
  footer?: ReactNode;
  width?: 'sm' | 'md' | 'lg';
}) {
  const { t } = useI18n();
  if (!open) return null;
  const widthCls = width === 'lg' ? 'max-w-2xl' : width === 'sm' ? 'max-w-sm' : 'max-w-lg';
  const handlePrint = () => {
    document.body.classList.add('mypage-print-active');
    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      document.body.classList.remove('mypage-print-active');
      window.removeEventListener('afterprint', cleanup);
      window.clearTimeout(fallbackTimer);
    };
    window.addEventListener('afterprint', cleanup);
    const fallbackTimer = window.setTimeout(cleanup, 120_000);
    window.print();
  };
  const printLayer = typeof document !== 'undefined' ? document.getElementById(MYPAGE_PRINT_LAYER_ID) : null;

  const modalTree = (
    <div className="fixed inset-0 z-1100 flex items-center justify-center px-4 print:p-0">
      <div
        className="absolute inset-0 bg-black/50 print:hidden"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`relative w-full ${widthCls} max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-[14px] bg-white border border-border print:max-h-none print:rounded-none print:border-none`}
        role="dialog"
        aria-modal="true"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white px-4 py-3.5 sm:px-6 sm:py-4 print:hidden">
          <h3 className="text-[15px] font-semibold text-ink min-w-0 break-keep">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted transition-colors hover:bg-[#F3F5F9] hover:text-ink"
            aria-label={t('mypage.modal.close' as never)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="px-4 py-5 sm:px-6 sm:py-6 print:px-0 print:py-0" id="mypage-print-region">
          {children}
        </div>
        <div className="sticky bottom-0 z-10 flex flex-col items-stretch gap-2 border-t border-border bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:py-4 print:hidden">
          {footer}
          {printable && (
            <button
              type="button"
              onClick={handlePrint}
              className="min-h-[44px] sm:min-h-0 rounded-lg bg-blue px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#0052CC]"
            >
              {t('mypage.modal.print' as never)}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] sm:min-h-0 rounded-lg border-[1.5px] border-[#D1D5DB] bg-white px-5 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-[#F9FAFB]"
          >
            {t('mypage.modal.close' as never)}
          </button>
        </div>
      </div>
    </div>
  );

  if (printLayer) {
    return createPortal(modalTree, printLayer);
  }
  return modalTree;
}

export function PrintField({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 border-b border-[#F3F5F9] py-2.5 text-[13px] last:border-b-0">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-ink sm:text-right break-words">{value}</span>
    </div>
  );
}
