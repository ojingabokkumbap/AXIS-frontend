import { useEffect, useMemo, useState } from 'react';
import { Download, Megaphone, MessageSquare } from 'lucide-react';
import {
  Card,
  PageHeader,
  Button,
  TableWrap,
  Table,
  Th,
  Td,
  Modal,
  SimpleKpiCard,
  pushToast,
  Pagination,
} from '@admin/components/shared/ui-kit';
import { useI18n } from '@admin/i18n';
import { adminApi, GradingRow, GradingCounts } from '@admin/services/api';

const PAGE_SIZE = 20;

export default function ResultsPage() {
  const { t } = useI18n();
  const [rows, setRows] = useState<GradingRow[] | null>(null);
  const [counts, setCounts] = useState<GradingCounts | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    Promise.all([adminApi.getGradingQueue('final'), adminApi.getGradingCounts()])
      .then(([r, c]) => {
        if (cancelled) return;
        setRows(r.data);
        setCounts(c.data);
      })
      .catch((e) => !cancelled && setError(e?.response?.data?.message ?? 'Failed to load results'));
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const items = rows ?? [];
    const passed = items.filter((r) => r.result === 'pass').length;
    const failed = items.filter((r) => r.result === 'fail').length;
    return {
      total: items.length,
      passed,
      failed,
      passRate: items.length > 0 ? ((passed / items.length) * 100).toFixed(1) : '—',
    };
  }, [rows]);

  const totalPages = rows ? Math.max(1, Math.ceil(rows.length / PAGE_SIZE)) : 1;
  const visible = rows ? rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : [];

  const toggleAll = () => {
    if (selected.size === visible.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(visible.map((r) => r.sessionId)));
    }
  };

  const onPublish = () => {
    setConfirmOpen(false);
    pushToast(t('res.toastPublished', { n: selected.size }), 'green');
    setSelected(new Set());
  };

  return (
    <div>
      <PageHeader
        title={t('page.results.title')}
        subtitle={t('page.results.sub')}
        actions={
          <>
            <Button variant="secondary">
              <Download className="w-3.5 h-3.5" /> {t('res.exportBatch')}
            </Button>
            <Button variant="secondary" disabled>
              <MessageSquare className="w-3.5 h-3.5" /> {t('res.objections', { n: 0 })}
            </Button>
            <Button
              variant="blue"
              disabled={selected.size === 0}
              onClick={() => setConfirmOpen(true)}
              className={selected.size === 0 ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <Megaphone className="w-3.5 h-3.5" /> {t('res.publish')}
            </Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-5 gap-3.5">
        <SimpleKpiCard
          label={t('res.kpi.total')}
          value={stats.total}
          unit={t('unit.people')}
          meta={
            <>
              <span className="font-medium text-[var(--gray-900)]">{stats.total}</span> {t('common.all')}
            </>
          }
        />
        <SimpleKpiCard
          label={t('res.kpi.passed')}
          value={stats.passed}
          unit={t('unit.people')}
          meta={
            <>
              <span className="font-medium text-[var(--green)]">{stats.passRate}%</span> {t('dash.col.passRate')}
            </>
          }
        />
        <SimpleKpiCard
          label={t('res.kpi.failed')}
          value={stats.failed}
          unit={t('unit.people')}
          meta={
            <>
              <span className="font-medium text-[var(--red)]">{stats.failed}</span> {t('res.fail')}
            </>
          }
        />
        <SimpleKpiCard
          label={t('res.kpi.partial')}
          value="—"
          meta={<span className="text-[var(--gray-500)]">{t('common.empty')}</span>}
        />
        <SimpleKpiCard
          label={t('res.kpi.objections')}
          value="—"
          meta={<span className="text-[var(--gray-500)]">{t('common.empty')}</span>}
        />
      </div>

      {error && (
        <Card className="p-4 mb-4 border-rose-200 bg-rose-50/40 text-sm text-rose-700">{error}</Card>
      )}

      <div className="border-0">
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th align="center">
                  <input
                    type="checkbox"
                    checked={selected.size === visible.length && visible.length > 0}
                    onChange={toggleAll}
                  />
                </Th>
                <Th>{t('res.col.examinee')}</Th>
                <Th>{t('res.col.examInfo')}</Th>
                <Th align="right">{t('res.col.written')}</Th>
                <Th align="right">{t('res.col.practical')}</Th>
                <Th align="right">{t('res.col.total')}</Th>
                <Th>{t('res.col.pass')}</Th>
                <Th>{t('res.col.publish')}</Th>
                <Th align="right">{t('res.col.actions')}</Th>
              </tr>
            </thead>
            <tbody>
              {rows === null && (
                <tr>
                  <Td colSpan={9} className="!text-center !text-[var(--gray-400)] !py-12">
                    {t('common.loading')}
                  </Td>
                </tr>
              )}
              {rows !== null && visible.length === 0 && (
                <tr>
                  <Td colSpan={9} className="!text-center !text-[var(--gray-400)] !py-12">
                    {t('common.empty')}
                  </Td>
                </tr>
              )}
              {visible.map((r) => {
                const checked = selected.has(r.sessionId);
                return (
                  <tr key={r.sessionId} className="hover:bg-[var(--gray-50)]">
                    <Td align="center">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const next = new Set(selected);
                          if (checked) next.delete(r.sessionId);
                          else next.add(r.sessionId);
                          setSelected(next);
                        }}
                      />
                    </Td>
                    <Td strong>{r.candidate}</Td>
                    <Td>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="font-semibold text-[var(--primary)]">
                          {r.certType === 'AXIS_C' ? 'AXIS-C' : r.certType === 'AXIS_H' ? 'AXIS-H' : 'AXIS'}
                        </span>
                        <b>{r.level}</b>
                        {r.roundNumber != null && (
                          <>
                            <span className="text-[var(--gray-500)]">·</span>
                            <span>{t('common.roundLabel', { n: r.roundNumber })}</span>
                          </>
                        )}
                      </span>
                    </Td>
                    <Td align="right" className="tabular-nums">
                      {r.writtenScore ?? '—'}
                    </Td>
                    <Td align="right" className="tabular-nums">
                      —
                    </Td>
                    <Td align="right" strong className="tabular-nums">
                      {r.writtenScore ?? '—'}
                    </Td>
                    <Td>
                      {r.result === 'pass' ? (
                        <span className="text-[var(--green)]">{t('res.pass')}</span>
                      ) : r.result === 'fail' ? (
                        <span className="text-[var(--red)]">{t('res.fail')}</span>
                      ) : (
                        <span className="text-[var(--gray-600)]">{t('res.pending')}</span>
                      )}
                    </Td>
                    <Td>
                      <span className="text-[var(--gray-600)]">{t('res.unpublished')}</span>
                    </Td>
                    <Td align="right">
                      <Button variant="blue" size="sm">
                        {t('common.detailBtn')}
                      </Button>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrap>
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          total={rows?.length}
        />
      </div>
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={null}
        width={480}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              {t('res.cancel')}
            </Button>
            <Button variant="blue" onClick={onPublish}>
              {t('res.publishConfirm')}
            </Button>
          </>
        }
      >
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-[var(--blue-50)] grid place-items-center mx-auto mb-4">
            <Megaphone className="w-7 h-7 text-[var(--blue)]" />
          </div>
          <h3 className="text-[17px] font-extrabold text-[var(--primary)] mb-2 tracking-tight">
            {t('res.confirmTitle')}
          </h3>
          <p className="text-[13px] text-[var(--gray-600)] leading-relaxed mb-4">
            {t('res.confirmBody', { n: selected.size })}
          </p>
          <div className="text-[12px] text-[var(--orange)] bg-[var(--orange-50)] border border-orange-200 rounded-lg px-3 py-2 text-left">
            {t('res.confirmFooter')}
          </div>
        </div>
      </Modal>
      {/* counts/stats currently unused beyond UI hooks; reserved for future kpi tweaks */}
      <span className="hidden">{counts ? '' : ''}</span>
    </div>
  );
}
