import { Table, TableWrap, Th, Td } from '@admin/components/shared/ui-kit';
import { useI18n } from '@admin/i18n';
import type { UserActivity } from '@admin/services/api';
import { fmtDateTime } from '../../examinees/lib/format';

export function ActivityTab({ activity }: { activity: UserActivity | null }) {
  const { t } = useI18n();

  if (!activity) {
    return <div className="py-12 text-center text-sm text-slate-400">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-8">
      <p className="text-xs text-slate-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
        {t('mem.activity.historicalNote')}
      </p>

      <section>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">{t('mem.activity.loginHistory')}</h3>
        {activity.loginHistory.length === 0 ? (
          <div className="text-sm text-slate-400 py-4">{t('mem.activity.emptyLogin')}</div>
        ) : (
          <TableWrap>
            <Table className="text-sm [&_td]:py-2 [&_th]:py-2">
              <thead>
                <tr>
                  <Th>{t('common.time')}</Th>
                  <Th>{t('mem.activity.ip')}</Th>
                  <Th>{t('mem.activity.source')}</Th>
                  <Th className="text-left!">{t('mem.activity.userAgent')}</Th>
                </tr>
              </thead>
              <tbody>
                {activity.loginHistory.map((row, i) => (
                  <tr key={`${row.at}-${i}`}>
                    <Td muted className="whitespace-nowrap tabular-nums">{fmtDateTime(row.at)}</Td>
                    <Td className="font-mono text-xs">{row.ip}</Td>
                    <Td>{row.source === 'admin' ? 'Admin' : 'Web'}</Td>
                    <Td className="text-left! text-xs text-slate-500 max-w-md truncate">
                      <span title={row.userAgent ?? undefined}>{row.userAgent ?? '—'}</span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        )}
      </section>

      {activity.consentIps.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-800 mb-3">{t('mem.activity.consentIps')}</h3>
          <TableWrap>
            <Table className="text-sm [&_td]:py-2 [&_th]:py-2">
              <thead>
                <tr>
                  <Th>{t('common.time')}</Th>
                  <Th>{t('mem.activity.ip')}</Th>
                  <Th className="text-left!">Type</Th>
                </tr>
              </thead>
              <tbody>
                {activity.consentIps.map((row, i) => (
                  <tr key={`consent-${i}`}>
                    <Td muted className="whitespace-nowrap">{fmtDateTime(row.consentedAt)}</Td>
                    <Td className="font-mono text-xs">{row.ipAddress ?? '—'}</Td>
                    <Td className="text-left! text-xs">{row.consentType}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        </section>
      )}

      {activity.niceIps.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-800 mb-3">{t('mem.activity.niceIps')}</h3>
          <TableWrap>
            <Table className="text-sm [&_td]:py-2 [&_th]:py-2">
              <thead>
                <tr>
                  <Th>{t('common.time')}</Th>
                  <Th>{t('mem.activity.ip')}</Th>
                  <Th className="text-left!">Auth</Th>
                </tr>
              </thead>
              <tbody>
                {activity.niceIps.map((row, i) => (
                  <tr key={`nice-${i}`}>
                    <Td muted className="whitespace-nowrap">{fmtDateTime(row.createdAt)}</Td>
                    <Td className="font-mono text-xs">{row.ipAddress ?? '—'}</Td>
                    <Td className="text-left! text-xs">{row.authType}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        </section>
      )}
    </div>
  );
}
