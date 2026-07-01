import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, FileText, Megaphone, MessageCircle, ScrollText } from 'lucide-react';
import { useI18n } from '@/i18n';
import { InfoCallout } from '@/components/InfoCallout';
import {
  Btn,
  EmptyState,
  KebabMenu,
  SectionTitle,
} from '../primitives';

const TABLE_WRAP = 'w-full overflow-x-auto border-t-2 border-ink mt-4 mb-2';
import {
  ExamGateModal,
  ReceiptModal,
  RefundPolicyModal,
} from '../SharedModals';
import {
  certLabel,
  formatExamDate,
  formatKrw,
  formatLocalDateTime,
  openPrintPopup,
  regBadge,
} from '../helpers';
import type { DashboardDto, RegistrationDto } from '../types';

function RegistrationsHero({ data }: { data: DashboardDto }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const completedExams = data.registrations.filter(
    (registration) => registration.status === 'EXAM_COMPLETED',
  ).length;

  const summaryItems = [
    {
      key: 'requested',
      icon: ScrollText,
      label: t('sec.registrations.summary.applied' as never),
      value: data.registrationStats.total,
    },
    {
      key: 'attended',
      icon: ClipboardCheck,
      label: t('sec.registrations.summary.attended' as never),
      value: completedExams,
    },
    {
      key: 'scores',
      icon: FileText,
      label: t('sec.registrations.summary.scores' as never),
      value: data.results.length,
    },
  ];

  return (
    <section className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,2.35fr)_minmax(280px,1fr)]">
      <div className="relative overflow-hidden rounded-[22px] bg-[#DDEAFE] px-6 py-6 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-black sm:text-[28px]">
              {t('sec.registrations.summary.greeting' as never, { name: data.profile.name })}
            </h2>
            <p className="text-[15px] text-[#475467]">
              {t('sec.registrations.summary.caption' as never)}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-5 sm:gap-8 lg:min-w-[360px]">
            {summaryItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#2F67DA]">
                    <Icon className="h-6 w-6" strokeWidth={2.1} />
                  </div>
                  <div className="text-[15px] font-medium text-[#344054]">{item.label}</div>
                  <div className="mt-3 mb-3 font-en text-[40px] font-semibold leading-none tracking-[-0.03em] text-black">
                    {item.value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div
        role="link"
        tabIndex={0}
        onClick={() => navigate('/qna?tab=notice')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate('/qna?tab=notice');
          }
        }}
        className="relative overflow-hidden rounded-[22px] bg-[#D8F3E6] px-6 py-6 transition-transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-[#60CDB0] cursor-pointer sm:px-8 sm:py-7"
      >
        <div className="max-w-[240px]">
          <h3 className="text-[24px] font-semibold tracking-[-0.03em] text-black sm:text-[28px]">
            {t('sec.registrations.notice.title' as never)}
          </h3>
          <p className="mt-2 text-[15px] leading-[1.7] text-[#375166]">
            {t('sec.registrations.notice.body' as never)}
          </p>
        </div>
        <Megaphone className="pointer-events-none absolute bottom-7 right-7 h-16 w-16 text-[#60CDB0]" strokeWidth={1.9} />
      </div>
    </section>
  );
}

function RegistrationsSection({
  data,
  onCancel,
  onRefresh,
  onPayNow,
}: {
  data: DashboardDto;
  onCancel: (id: string) => Promise<void>;
  onRefresh: () => void;
  onPayNow: (reg: RegistrationDto) => void;
}) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [receiptReg, setReceiptReg] = useState<RegistrationDto | null>(null);
  const [refundOpen, setRefundOpen] = useState(false);
  const [gateReg, setGateReg] = useState<RegistrationDto | null>(null);

  const handleCancel = async (id: string) => {
    if (!confirm(t('sec.registrations.confirmCancel' as never))) return;
    setBusyId(id);
    try {
      await onCancel(id);
      onRefresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <RegistrationsHero data={data} />
      <SectionTitle title={t('sec.registrations.title')} sub="" />

    <InfoCallout tone="blue" >
      <p>{t('sec.registrations.info.voucher' as never)}</p>
    </InfoCallout>
    <InfoCallout tone="red" className="mb-6">
      <p>{t('sec.registrations.info.refund' as never)}</p>
    </InfoCallout>
    {/* 
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
        <StatCard label="Total Registered" value={String(stats.total)} suffix="exams" />
        <StatCard label="Awaiting Payment" value={String(stats.awaitingPayment)} suffix="pending" />
        <StatCard label="Confirmed" value={String(stats.confirmed)} suffix={stats.confirmed === 1 ? 'exam' : 'exams'} />
        <StatCard label="Cancelled" value={String(stats.cancelled)} suffix="refunded" />
      </div>
     */}

      <div className={TABLE_WRAP}>
        <table className="data-table" style={{ minWidth: 940 }}>
          <thead>
            <tr>
              <th style={{ width: 100 }}>{t('sec.registrations.col.round' as never)}</th>
              <th style={{ width: 220 }}>{t('sec.registrations.col.cert' as never)}</th>
              <th style={{ width: 180 }}>{t('sec.registrations.col.status' as never)}</th>
              <th style={{ width: 160 }}>{t('sec.registrations.col.examDate' as never)}</th>
              <th style={{ width: 170 }} className="text-right"></th>
            </tr>
          </thead>
          <tbody>
            {data.registrations.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState description={t('sec.registrations.empty.hint' as never)}>
                    {t('sec.registrations.empty.title' as never)}
                  </EmptyState>
                </td>
              </tr>
            ) : (
              data.registrations.map((r) => {
                const deadlineExpired = r.examDeadlineExpired;
                let statusText: string;
                let statusCls: string;
                if (r.status === 'PAID' && deadlineExpired && r.examDeadline) {
                  statusText = t('sec.registrations.status.paidExpired' as never, { date: formatExamDate(r.examDeadline) });
                  statusCls = 'text-status-danger font-semibold';
                } else if (r.status === 'PAID' && r.examDeadline) {
                  statusText = t('sec.registrations.status.paidUntil' as never, { date: formatExamDate(r.examDeadline) });
                  statusCls = 'font-medium';
                } else if (r.status === 'PAID') {
                  statusText = t('sec.registrations.status.paid' as never);
                  statusCls = 'text-ink font-semibold text-[14px]';
                } else if (r.status === 'PENDING_PAYMENT') {
                  statusText = r.seatHeldUntil
                    ? t('sec.registrations.status.pendingUntil' as never, { date: formatLocalDateTime(r.seatHeldUntil) })
                    : t('sec.registrations.status.pending30' as never);
                  statusCls = 'text-status-grading font-semibold text-[14px]';
                } else if (r.status === 'REFUNDED') {
                  statusText = r.latestPayment?.refundAmount
                    ? t('sec.registrations.status.refundedAmount' as never, { amount: formatKrw(r.latestPayment.refundAmount) })
                    : t('sec.registrations.status.refunded' as never);
                  statusCls = 'text-muted text-[14px]';
                } else if (r.status === 'CANCELLED') {
                  statusText = t('sec.registrations.status.cancelled' as never);
                  statusCls = 'text-muted';
                } else {
                  statusText = regBadge(r.status).text;
                  statusCls = 'text-muted';
                }
                return (
                  <tr key={r.id}>
                    <td className="text-muted font-en">
                      {t('sec.registrations.roundSuffix' as never, { n: r.schedule.roundNumber })}
                    </td>
                    <td>
                      <span className="text-ink text-center font-semibold">
                        {certLabel(r.certType, r.level)}
                      </span>
                    </td>
                    <td>
                      <span className={`text-[14px] text-center ${statusCls}`}>{statusText}</span>
                    </td>
                    <td className="text-muted ">
                      {formatExamDate(r.schedule.examDate, r.schedule.examStartTime)}
                    </td>
                    <td>
                      <div className="inline-flex gap-1.5 items-center justify-end w-full">
                        {r.status === 'PAID' && !deadlineExpired && (
                          <Btn
                            variant="blue"
                            className="btn-sm bg-blue-500"
                            onClick={() => openPrintPopup(`/mypage/voucher/${encodeURIComponent(r.id)}`, `axis-voucher-${r.id}`)}
                          >
                            {t('mypage.act.printVoucher' as never)}
                          </Btn>
                        )}
                        {r.status === 'PENDING_PAYMENT' && (
                          <Btn variant="orange" className="btn-sm" onClick={() => onPayNow(r)}>{t('sec.registrations.act.pay' as never)}</Btn>
                        )}
                        {(r.status === 'CANCELLED' || r.status === 'REFUNDED') && (
                          <Btn variant="blue" className="btn-sm" onClick={() => setReceiptReg(r)}>
                            {t('mypage.act.receipt' as never)}
                          </Btn>
                        )}

                        {r.status === 'PAID' && (
                          <>
                            <KebabMenu
                              items={[
                                { label: t('sec.registrations.act.receiptView' as never), onClick: () => setReceiptReg(r) },
                                { label: t('sec.registrations.act.refundPolicy' as never), onClick: () => setRefundOpen(true) },
                              ]}
                            />
                          </>
                        )}
                        {r.status === 'PENDING_PAYMENT' && (
                          <Btn
                            variant="danger"
                            className="btn-sm"
                            onClick={() => handleCancel(r.id)}
                            disabled={busyId === r.id}
                          >
                            {busyId === r.id ? t('sec.registrations.act.cancelling' as never) : t('sec.registrations.act.cancel' as never)}
                          </Btn>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ReceiptModal
        open={!!receiptReg}
        reg={receiptReg}
        holderName={data.profile.name}
        onClose={() => setReceiptReg(null)}
      />
      <RefundPolicyModal open={refundOpen} onClose={() => setRefundOpen(false)} />
      <ExamGateModal
        open={!!gateReg}
        reg={gateReg}
        onClose={() => setGateReg(null)}
        onEnvCheck={() => navigate('/env-check')}
      />
    </>
  );
}

export function RegistrationsPanel({
  data,
  onCancel,
  onRefresh,
  onPayNow,
}: {
  data: DashboardDto;
  onCancel: (id: string) => Promise<void>;
  onRefresh: () => void;
  onPayNow: (reg: RegistrationDto) => void;
}) {
  return (
    <RegistrationsSection
      data={data}
      onCancel={onCancel}
      onRefresh={onRefresh}
      onPayNow={onPayNow}
    />
  );
}
