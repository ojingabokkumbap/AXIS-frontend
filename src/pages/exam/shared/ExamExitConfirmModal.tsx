import { useI18n } from '@/i18n';
import { EXAM } from './tokens';

interface Props {
  open: boolean;
  /** Demo uses lighter copy; real exam warns about unsubmitted state. */
  variant?: 'demo' | 'exam';
  onContinue: () => void;
  onExit: () => void;
}

/**
 * Confirms leaving the live exam runner — continue or exit to the site home.
 */
export function ExamExitConfirmModal({
  open,
  variant = 'exam',
  onContinue,
  onExit,
}: Props) {
  const { t } = useI18n();
  if (!open) return null;

  const titleKey =
    variant === 'demo' ? ('demo.exitConfirm.title' as const) : ('runner.exitConfirm.title' as const);
  const bodyKey =
    variant === 'demo' ? ('demo.exitConfirm.body' as const) : ('runner.exitConfirm.body' as const);
  const continueKey =
    variant === 'demo' ? ('demo.exitConfirm.continue' as const) : ('runner.exitConfirm.continue' as const);
  const exitKey =
    variant === 'demo' ? ('demo.exitConfirm.exit' as const) : ('runner.exitConfirm.exit' as const);

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="exam-exit-confirm-title"
    >
      <div className="max-w-md w-full bg-[var(--exam-surface,#fff)] rounded-xl overflow-hidden shadow-2xl">
        <div className="bg-[var(--exam-accent,#2563EB)] px-6 py-4">
          <h2
            id="exam-exit-confirm-title"
            className="text-[19px] sm:text-[22px] font-semibold tracking-tight text-white"
          >
            {t(titleKey as never)}
          </h2>
        </div>
        <div className="p-6">
          <p className={`${EXAM.text.body} ${EXAM.color.body} leading-relaxed`}>{t(bodyKey as never)}</p>
        </div>
        <div className="flex gap-2.5 px-6 py-4 border-t border-[var(--exam-border,#E5E7EB)] bg-[var(--exam-surface-2,#F8FAFC)]">
          <button
            type="button"
            onClick={onContinue}
            className={`flex-1 h-11 rounded-md border border-[var(--exam-border,#E5E7EB)] bg-[var(--exam-surface,#fff)] ${EXAM.text.button} ${EXAM.color.ink} hover:bg-[var(--exam-surface-2,#F1F5F9)] transition-colors`}
          >
            {t(continueKey as never)}
          </button>
          <button
            type="button"
            onClick={onExit}
            className={`flex-1 h-11 rounded-md bg-status-danger text-white hover:bg-[#B91C1C] transition-colors ${EXAM.text.button}`}
          >
            {t(exitKey as never)}
          </button>
        </div>
      </div>
    </div>
  );
}
