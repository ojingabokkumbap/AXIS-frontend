import { StatusBadge, Table, TableWrap, Th, Td } from '@admin/components/shared/ui-kit';
import { useI18n } from '@admin/i18n';
import type { ExamineeDetail } from '@admin/services/api';
import { fmtDate } from '../lib/format';

export function PenaltyTab({ detail }: { detail: ExamineeDetail }) {
  const { t } = useI18n();
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
            <Th>{t('exm.penalty.released')}</Th>
            <Th>{t('exm.penalty.statusCol')}</Th>
          </tr>
        </thead>
        <tbody>
          {detail.penalties.map((p) => (
            <tr key={p.id}>
              <Td className="text-left!">{p.reason}</Td>
              <Td muted className="whitespace-nowrap tabular-nums">
                {fmtDate(p.startAt)} ~ {fmtDate(p.endAt)}
              </Td>
              <Td muted className="whitespace-nowrap tabular-nums">
                {p.releasedAt ? (
                  <>
                    {fmtDate(p.releasedAt)}
                    {p.releaseReason && (
                      <div className="text-[11px] text-slate-400">{p.releaseReason}</div>
                    )}
                  </>
                ) : (
                  '—'
                )}
              </Td>
              <Td>
                <StatusBadge tone={p.status === 'ACTIVE' ? 'red' : 'gray'}>
                  {p.status === 'ACTIVE' ? t('exm.account.SUSPENDED') : t('exm.penalty.released')}
                </StatusBadge>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrap>
  );
}
