import { useState } from 'react';
import { Monitor, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import type { DisplayState } from '../hooks/useDisplayMonitor';
import { useI18n } from '@/i18n';
import { EXAM } from '@/pages/exam/shared';

interface Props {
  state: DisplayState;
  onRecheck: () => Promise<void> | void;
  onRequestPermission?: () => Promise<boolean> | boolean;
}

/**
 * Full-screen blocking overlay shown whenever the candidate has an extended
 * desktop or a second monitor connected. Cannot be dismissed — only the
 * "I disconnected it, recheck" button moves them forward, and only if the
 * detector now reports a single display.
 *
 * 디자인: 러너/데모와 동일한 라이트 EXAM 테마 (FullscreenExitModal 패턴 —
 * 흰 카드 + danger 헤더 바 + EXAM 토큰). var(--exam-*) 기반이라 다크 테마에서도
 * 자동으로 스왑된다.
 */
export function ExternalDisplayBlocker({ state, onRecheck, onRequestPermission }: Props) {
  const [busy, setBusy] = useState(false);
  const { t } = useI18n();

  if (!state.blocked) return null;

  const handleRecheck = async () => {
    setBusy(true);
    try {
      await onRecheck();
    } finally {
      setBusy(false);
    }
  };

  const handlePermission = async () => {
    if (!onRequestPermission) return;
    setBusy(true);
    try {
      await onRequestPermission();
    } finally {
      setBusy(false);
    }
  };

  const reasons: string[] = [];
  if (state.displayCount > 1) reasons.push(t('extdisp.reasonMonitors' as never, { n: state.displayCount }));
  if (state.isExtended) reasons.push(t('extdisp.reasonExtended' as never));
  if (state.geometryMismatch) reasons.push(t('extdisp.reasonGeometry' as never));

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="ext-display-title"
      className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="max-w-lg w-full bg-[var(--exam-surface,#fff)] rounded-xl overflow-hidden shadow-2xl border border-[#FECACA] flex flex-col max-h-[92vh]">
        {/* Header bar — danger */}
        <div className="bg-status-danger px-6 py-4 flex items-center gap-3 shrink-0">
          <AlertTriangle className="w-6 h-6 text-white" strokeWidth={2} />
          <h2 id="ext-display-title" className="text-[19px] sm:text-[22px] font-semibold tracking-tight text-white leading-tight">
            {t('extdisp.title' as never)}
          </h2>
        </div>

        <div className="p-6 overflow-y-auto">

          <p className={`${EXAM.text.body} ${EXAM.color.body} leading-relaxed mb-4`}>
            {t('extdisp.body1' as never)}{' '}
            <strong className={`${EXAM.color.ink} font-bold`}>{t('extdisp.bodyOne' as never)}</strong>{' '}
            {t('extdisp.body2' as never)}{' '}
            <strong className={`${EXAM.color.ink} font-bold`}>{t('extdisp.bodyRecheck' as never)}</strong>{' '}
            {t('extdisp.body3' as never)}
          </p>

          {/* 감지된 사항 — 중립 패널 */}
          <div className="bg-[var(--exam-surface-2,#F8FAFC)] border border-[var(--exam-border,#E5E7EB)] rounded-xl p-4 mb-4 space-y-1.5">
            <div className={`flex items-center gap-2 ${EXAM.text.pill} ${EXAM.color.warning} font-semibold uppercase tracking-wide`}>
              <Monitor className="w-3.5 h-3.5" /> {t('extdisp.detected' as never)}
            </div>
            {reasons.length === 0 ? (
              <div className={`${EXAM.text.helper} ${EXAM.color.muted}`}>{t('extdisp.unknown' as never)}</div>
            ) : (
              <ul className={`${EXAM.text.helper} ${EXAM.color.body} space-y-0.5 list-disc pl-5`}>
                {reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            )}
            {state.displays.length > 0 && (
              <div className="pt-2 mt-2 border-t border-[var(--exam-border,#E5E7EB)]">
                <div className={`${EXAM.text.helper} ${EXAM.color.muted} mb-1`}>{t('extdisp.list' as never)}</div>
                <ul className={`${EXAM.text.helper} ${EXAM.color.body} space-y-0.5`}>
                  {state.displays.map((d, i) => (
                    <li key={`${d.label}-${i}`}>
                      {i + 1}. {d.label} — {d.width}×{d.height}
                      {d.isPrimary ? ' · primary' : ''}
                      {d.isInternal === false ? ' · external' : d.isInternal === true ? ' · internal' : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 기록 안내 — warning 박스 */}
          <div className={`${EXAM.surface.warningBox} p-3 mb-4 ${EXAM.text.helper} ${EXAM.color.warning} leading-relaxed`}>
            {t('extdisp.recordedNote' as never)}
          </div>

          {!state.permissionGranted && onRequestPermission && (
            <button
              onClick={handlePermission}
              disabled={busy}
              className={`w-full mb-2 h-11 rounded-md border border-[var(--exam-border,#E5E7EB)] bg-[var(--exam-surface,#fff)] ${EXAM.color.ink} hover:bg-[var(--exam-surface-2,#F1F5F9)] transition-colors disabled:opacity-50 ${EXAM.text.button}`}
            >
              {t('extdisp.allowPerm' as never)}
            </button>
          )}

          <button
            onClick={handleRecheck}
            disabled={busy}
            className={`w-full h-12 rounded-md bg-status-danger hover:bg-[#B91C1C] text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${EXAM.text.button}`}
          >
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('extdisp.checking' as never)}
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                {t('extdisp.recheck' as never)}
              </>
            )}
          </button>

          {state.permissionError && (
            <p className={`mt-3 ${EXAM.text.pill} ${EXAM.color.danger} text-center`}>
              {t('extdisp.permError' as never)}: {state.permissionError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
