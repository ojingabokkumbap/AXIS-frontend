import { useI18n } from '@/i18n';

export type TerminationReason =
  | 'MULTIPLE_FACES'
  | 'VOICE_STRIKES'
  | 'GAZE_STRIKES'
  | 'PAGE_LEAVE_STRIKES'
  | 'DUPLICATE_TAB'
  | 'IDENTITY_MISMATCH';

const REASON_KEY: Record<TerminationReason, string> = {
  MULTIPLE_FACES: 'terminated.MULTIPLE_FACES',
  VOICE_STRIKES: 'terminated.AUDIO',
  GAZE_STRIKES: 'terminated.GAZE',
  PAGE_LEAVE_STRIKES: 'terminated.PAGE_LEAVE',
  DUPLICATE_TAB: 'terminated.DUPLICATE_TAB',
  IDENTITY_MISMATCH: 'terminated.IDENTITY',
};

const REASON_EN: Record<TerminationReason, string> = {
  MULTIPLE_FACES: 'Another person was detected in the camera frame.',
  VOICE_STRIKES: 'Sustained voice or room noise was detected repeatedly.',
  GAZE_STRIKES: 'You looked away from the screen too many times.',
  PAGE_LEAVE_STRIKES: 'You left the exam window too many times.',
  DUPLICATE_TAB: 'The same exam is already running in another tab.',
  IDENTITY_MISMATCH: 'The person at the camera does not match the verified test-taker.',
};

export function ExamTerminatedOverlay({
  reason,
  onHome,
  onMyPage,
}: {
  reason: TerminationReason;
  onHome: () => void;
  onMyPage: () => void;
}) {
  const { t, lang } = useI18n();
  const primary = t(REASON_KEY[reason] as never);
  const secondary = lang === 'ko' ? REASON_EN[reason] : t(REASON_KEY[reason] as never);

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-6"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="exam-terminated-title"
    >
      <div className="max-w-md w-full bg-gray-900 border border-red-500/70 rounded-2xl p-8 text-center shadow-2xl">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
          <span className="text-4xl">⛔</span>
        </div>
        <h2
          id="exam-terminated-title"
          className="text-2xl font-extrabold text-white mb-2"
        >
          {t('terminated.title' as never)}
        </h2>
        <div className="rounded-lg bg-red-950/50 border border-red-500/40 p-3 mb-4">
          <p className="text-sm text-red-200 font-semibold mb-1">{primary}</p>
          {lang === 'ko' && (
            <p className="text-xs text-red-300/80">{secondary}</p>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-6 leading-relaxed">
          {t('terminated.body1' as never)}{' '}
          {t('terminated.body2' as never)}
        </p>
        <div className="space-y-2">
          <button
            onClick={onHome}
            autoFocus
            className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold"
          >
            {t('terminated.toHome' as never)}
          </button>
          <button
            onClick={onMyPage}
            className="w-full h-11 rounded-xl border border-gray-600 hover:bg-gray-800 text-gray-200 text-sm"
          >
            {t('terminated.toMyPage' as never)}
          </button>
        </div>
      </div>
    </div>
  );
}
