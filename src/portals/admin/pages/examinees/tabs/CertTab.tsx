import { StatusBadge, Table, TableWrap, Th, Td } from '@admin/components/shared/ui-kit';
import { useI18n } from '@admin/i18n';
import type { ExamineeDetail } from '@admin/services/api';
import { fmtDate } from '../lib/format';

export function CertTab({ detail }: { detail: ExamineeDetail }) {
  const { t } = useI18n();
  if (detail.certificates.length === 0) {
    return <div className="py-6 text-center text-sm text-slate-400">{t('exm.cert.empty')}</div>;
  }
  return (
    <TableWrap>
      <Table className="text-sm [&_td]:py-2 [&_th]:py-2">
        <thead>
          <tr>
            <Th className="text-left!">{t('exm.cert.number')}</Th>
            <Th>{t('exm.cert.subject')}</Th>
            <Th>{t('exm.cert.issued')}</Th>
            <Th>{t('exm.cert.until')}</Th>
            <Th>{t('exm.cert.score')}</Th>
            <Th>{t('exm.col.status')}</Th>
          </tr>
        </thead>
        <tbody>
          {detail.certificates.map((c) => (
            <tr key={c.id}>
              <Td mono className="text-left! whitespace-nowrap text-[var(--primary)] font-medium">
                {c.certNumber}
              </Td>
              <Td className="whitespace-nowrap">
                {c.certType} {c.level}
              </Td>
              <Td muted className="whitespace-nowrap tabular-nums">
                {fmtDate(c.issuedAt)}
              </Td>
              <Td muted className="whitespace-nowrap tabular-nums">
                {fmtDate(c.validUntil)}
              </Td>
              <Td className="tabular-nums">{c.totalScore ?? '—'}</Td>
              <Td>
                <StatusBadge tone="purple">{t('exm.status.CERTIFIED')}</StatusBadge>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrap>
  );
}
