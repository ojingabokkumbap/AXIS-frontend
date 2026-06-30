import { useState } from 'react';
import { Button, StatusBadge, Table, TableWrap, Th, Td } from '@admin/components/shared/ui-kit';
import { useI18n } from '@admin/i18n';
import type { MemberProfile } from '@admin/services/api';
import { adminApi } from '@admin/services/api';
import { fmtDate } from '../../examinees/lib/format';

export function MemberPenaltiesTab({
  detail,
  onReload,
}: {
  detail: MemberProfile;
  onReload: () => void;
}) {
  const { t } = useI18n();
  const [releasingId, setReleasingId] = useState<string | null>(null);

  const handleRelease = async (penaltyId: string) => {
    const releaseReason = window.prompt(t('mem.penalty.releaseReason'));
    if (!releaseReason?.trim()) return;
    setReleasingId(penaltyId);
    try {
      await adminApi.releasePenalty(detail.user.id, penaltyId, releaseReason.trim());
      onReload();
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      window.alert(err.response?.data?.message ?? 'Failed to release penalty');
    } finally {
      setReleasingId(null);
    }
  };

  if (detail.penalties.length === 0) {
    return <div className="py-6 text-center text-sm text-slate-400">{t('exm.penalty.empty')}</div>;
  }

  return (
    <TableWrap>
      <Table className="text-sm [&_td]:py-2 [&_th]:py-2">
        <thead>
          <tr>
            <Th className="text-left!">{t('exm.penalty.reason')}</Th>
            <Th>{t('exm.penalty.period')}</Th>
            <Th>{t('exm.penalty.statusCol')}</Th>
            <Th>{t('exm.history.manage')}</Th>
          </tr>
        </thead>
        <tbody>
          {detail.penalties.map((p) => (
            <tr key={p.id}>
              <Td className="text-left!">{p.reason}</Td>
              <Td muted className="whitespace-nowrap tabular-nums">
                {fmtDate(p.startAt)} ~ {fmtDate(p.endAt)}
              </Td>
              <Td>
                <StatusBadge tone={p.status === 'ACTIVE' ? 'red' : 'gray'}>
                  {p.status === 'ACTIVE' ? t('exm.account.SUSPENDED') : t('exm.penalty.released')}
                </StatusBadge>
              </Td>
              <Td>
                {p.status === 'ACTIVE' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={releasingId === p.id}
                    onClick={() => handleRelease(p.id)}
                  >
                    {t('mem.penalty.release')}
                  </Button>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrap>
  );
}
