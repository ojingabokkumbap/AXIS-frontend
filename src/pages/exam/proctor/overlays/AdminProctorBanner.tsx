import { AlertTriangle, X } from 'lucide-react';
import { useI18n } from '@/i18n';

export interface AdminProctorBannerProps {
  message: string;
  onDismiss: () => void;
}

/** Dismissible banner when a proctor sends a manual warning during the exam. */
export function AdminProctorBanner({ message, onDismiss }: AdminProctorBannerProps) {
  const { t } = useI18n();
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] flex items-start gap-3 border-b border-amber-300 bg-amber-50 px-4 py-3 shadow-md"
      role="alert"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-amber-900">{t('exam.adminWarning.title' as never)}</p>
        <p className="mt-0.5 text-sm text-amber-800">{message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded p-1 text-amber-700 hover:bg-amber-100"
        aria-label={t('exam.adminWarning.dismiss' as never)}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
