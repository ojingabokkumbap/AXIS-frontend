import { useState } from 'react';
import { Button, StatusBadge, Table, TableWrap, Th, Td } from '@admin/components/shared/ui-kit';
import { useI18n } from '@admin/i18n';
import type { ExamineeRegistrationDetail, MemberProfile } from '@admin/services/api';
import { adminApi } from '@admin/services/api';
import { fmtDate } from '../../examinees/lib/format';
import { certLabel } from '../../examinees/lib/status';
import { SessionStatusPill } from '../../examinees/components/SessionStatusPill';

export function ExamsTab({
  detail,
  onReload,
}: {
  detail: MemberProfile;
  onReload: () => void;
}) {
  const { t } = useI18n();
  const [grantingId, setGrantingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGrant = async (reg: ExamineeRegistrationDetail) => {
    if (!window.confirm(t('mem.exams.grantConfirm'))) return;
    setGrantingId(reg.id);
    setError(null);
    try {
      await adminApi.grantAttempt(reg.id);
      onReload();
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? 'Failed to grant attempt');
    } finally {
      setGrantingId(null);
    }
  };

  if (detail.registrations.length === 0) {
    return <div className="py-6 text-center text-sm text-slate-400">{t('exm.history.empty')}</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      {detail.registrations.map((reg) => (
        <div key={reg.id} className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 px-4 py-3">
            <div>
              <div className="font-semibold text-[var(--primary)]">
                {certLabel(reg.certType)} {reg.level} · {t('common.round')} {reg.schedule.roundNumber}
              </div>
              {reg.registrationNumber && (
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{reg.registrationNumber}</div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-slate-600">
                {t('mem.exams.attempts', {
                  used: reg.attemptsUsed,
                  max: reg.maxAttempts,
                  left: reg.attemptsLeft,
                })}
              </span>
              {reg.canGrantAttempt && (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={grantingId === reg.id}
                  onClick={() => handleGrant(reg)}
                >
                  {t('mem.exams.grantAttempt')}
                </Button>
              )}
            </div>
          </div>
          {reg.sessions.length === 0 ? (
            <div className="px-4 py-4 text-sm text-slate-400">—</div>
          ) : (
            <TableWrap>
              <Table className="text-sm [&_td]:py-2 [&_th]:py-2">
                <thead>
                  <tr>
                    <Th>{t('exm.history.attempt', { n: '#' })}</Th>
                    <Th>{t('exm.col.status')}</Th>
                    <Th>{t('exm.history.score')}</Th>
                    <Th>{t('exm.history.result')}</Th>
                    <Th className="text-left!">{t('mem.exams.failReason')}</Th>
                  </tr>
                </thead>
                <tbody>
                  {reg.sessions.map((s) => (
                    <tr key={s.id}>
                      <Td className="tabular-nums">#{s.attemptNo}</Td>
                      <Td>
                        <SessionStatusPill status={s.status} passed={s.passed} />
                      </Td>
                      <Td className="tabular-nums whitespace-nowrap">
                        {s.totalScore != null ? (
                          <div>
                            <div>{s.totalScore}</div>
                            {(s.writtenScore != null || s.practicalScore != null) && (
                              <div className="text-[11px] text-slate-400">
                                W:{s.writtenScore ?? '—'} / P:{s.practicalScore ?? '—'}
                              </div>
                            )}
                          </div>
                        ) : (
                          '—'
                        )}
                      </Td>
                      <Td>
                        {s.passed === true && <StatusBadge tone="green">{t('result.pass')}</StatusBadge>}
                        {s.passed === false && <StatusBadge tone="red">{t('result.fail')}</StatusBadge>}
                        {s.passed == null && <span className="text-slate-400">—</span>}
                      </Td>
                      <Td className="text-left! text-xs text-slate-600 max-w-xs">
                        {s.failReason ?? '—'}
                        {s.submittedAt && (
                          <div className="text-[11px] text-slate-400 mt-0.5">{fmtDate(s.submittedAt)}</div>
                        )}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          )}
        </div>
      ))}
    </div>
  );
}
