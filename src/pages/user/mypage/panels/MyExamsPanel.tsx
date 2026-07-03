import { useMemo, useRef, useState, type ReactNode } from 'react';
import { isAxiosError } from 'axios';
import { useI18n } from '@/i18n';
import { registrationsApi, userApi } from '@/services/api';
import {
  Btn,
  EmptyState,
  SectionTitle,
} from '../primitives';
import {
  certLabel,
  formatExamDate,
  formatLocalDateTime,
  isEligibilityRefundEligible,
  registrationExamEntryState,
} from '../helpers';
import type { DashboardDto, ExamEntryGateKind, RegistrationDto } from '../types';
import { localizeEligibilityNote } from '../eligibilityNote';
import { InfoCallout } from '@/components/InfoCallout';
import { ResultModal, ResultModalButton, ResultModalInlineText } from '@/components/ResultModal';
import { openProtectedPdf } from '@/utils/openProtectedPdf';

const TABLE_WRAP = 'hidden md:block w-full overflow-x-auto border-t-2 border-ink mt-4 mb-2';

const ELIG_RESUBMIT_OPTION_IDS = ['L2_CERT', 'MGMT_2Y', 'AX_LEADER_COURSE'] as const;
type EligOptionId = (typeof ELIG_RESUBMIT_OPTION_IDS)[number];

const ELIG_OPTION_I18N: Record<EligOptionId, 'mypage.exams.elig.L2_CERT' | 'mypage.exams.elig.MGMT_2Y' | 'mypage.exams.elig.AX_LEADER_COURSE'> = {
  L2_CERT: 'mypage.exams.elig.L2_CERT',
  MGMT_2Y: 'mypage.exams.elig.MGMT_2Y',
  AX_LEADER_COURSE: 'mypage.exams.elig.AX_LEADER_COURSE',
};

type StatusPillTone = 'green' | 'amber' | 'red' | 'blue' | 'gray';

const STATUS_PILL: Record<StatusPillTone, string> = {
  green: 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]',
  amber: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]',
  red: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]',
  blue: 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]',
  gray: 'bg-[#F9FAFB] text-[#6B7280] border border-[#E5E7EB]',
};

function StatusPill({ tone, children }: { tone: StatusPillTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold tracking-[-0.01em] whitespace-nowrap ${STATUS_PILL[tone]}`}
    >
      {children}
    </span>
  );
}

function StatusCellWrap({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex flex-col gap-2 max-w-full md:max-w-[280px] py-1">{children}</div>
  );
}

function ReasonBox({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#B91C1C] mb-1">
        {label}
      </p>
      <p className="text-[13px] leading-[1.55] text-[#991B1B] break-words">{children}</p>
    </div>
  );
}

function ExamStatusCell({
  r,
  gate,
  deadlineExpired,
}: {
  r: RegistrationDto;
  gate: ExamEntryGateKind;
  deadlineExpired: boolean;
}) {
  const { t } = useI18n();

  const readyUntil =
    r.examDeadline && !deadlineExpired
      ? t('mypage.examStatus.readyUntil', { date: formatExamDate(r.examDeadline) })
      : null;

  const registrationUntil =
    r.examDeadline && !deadlineExpired
      ? t('mypage.examStatus.registrationUntil', { date: formatExamDate(r.examDeadline) })
      : null;

  if (r.status === 'PAID' && deadlineExpired && r.examDeadline) {
    return (
      <StatusCellWrap>
        <StatusPill tone="red">{t('mypage.examStatus.expired')}</StatusPill>
        <span className="text-[12px] text-muted">{formatExamDate(r.examDeadline)}</span>
      </StatusCellWrap>
    );
  }

  if (r.eligibilityRefundRequested) {
    return (
      <StatusCellWrap>
        <StatusPill tone="blue">{t('mypage.examStatus.refundReview')}</StatusPill>
        <p className="text-[12px] text-muted leading-[1.5]">{t('mypage.examStatus.refundReviewHint')}</p>
        {registrationUntil && (
          <span className="text-[11px] text-[#9CA3AF]">{registrationUntil}</span>
        )}
      </StatusCellWrap>
    );
  }

  if (gate === 'eligibility_rejected') {
    const note =
      localizeEligibilityNote(r.eligibilityNote, t) || t('mypage.examStatus.rejectedDefault');
    return (
      <StatusCellWrap>
        <StatusPill tone="red">{t('mypage.examStatus.rejected')}</StatusPill>
        <p className="text-[12px] text-muted leading-[1.5]">{t('mypage.examStatus.rejectedHint')}</p>
        <ReasonBox label={t('mypage.examStatus.reasonLabel')}>{note}</ReasonBox>
      </StatusCellWrap>
    );
  }

  if (gate === 'eligibility_pending') {
    return (
      <StatusCellWrap>
        <StatusPill tone="blue">{t('mypage.examStatus.pending')}</StatusPill>
        <p className="text-[12px] text-muted leading-[1.5]">{t('mypage.examStatus.pendingHint')}</p>
        {registrationUntil && (
          <span className="text-[11px] text-[#9CA3AF]">{registrationUntil}</span>
        )}
      </StatusCellWrap>
    );
  }

  if (gate === 'eligibility_missing_doc') {
    return (
      <StatusCellWrap>
        <StatusPill tone="amber">{t('mypage.examStatus.missingDoc')}</StatusPill>
        <p className="text-[12px] text-muted leading-[1.5]">{t('mypage.examStatus.missingDocHint')}</p>
        {registrationUntil && (
          <span className="text-[11px] text-[#9CA3AF]">{registrationUntil}</span>
        )}
      </StatusCellWrap>
    );
  }

  if (r.status === 'PAID' && r.examDeadline) {
    return (
      <StatusCellWrap>
        <StatusPill tone="green">{t('mypage.examStatus.ready')}</StatusPill>
        {readyUntil && <span className="text-[13px] text-ink leading-[1.5]">{readyUntil}</span>}
      </StatusCellWrap>
    );
  }

  if (r.status === 'PAID') {
    return <span className="text-[13px] text-ink">{t('mypage.examStatus.paidWaiting')}</span>;
  }

  if (r.status === 'PENDING_PAYMENT') {
    return (
      <span className="text-[13px] text-status-grading">
        {r.seatHeldUntil
          ? t('mypage.examStatus.payDeadline', { deadline: formatLocalDateTime(r.seatHeldUntil) })
          : t('mypage.examStatus.payWindow')}
      </span>
    );
  }

  return <span className="text-[13px] text-muted">—</span>;
}

function VoucherButton({
  regId,
  label,
  className = 'btn-sm min-w-[88px]',
}: {
  regId: string;
  label: string;
  className?: string;
}) {
  return (
    <Btn
      variant="blue"
      className={className}
      onClick={() =>
        openProtectedPdf(
          async () => (await userApi.downloadVoucherPdf(regId)).data,
          `AXIS_voucher_${regId}.pdf`,
        )
      }
    >
      {label}
    </Btn>
  );
}

export function MyExamsPanel({
  data,
  onEnter,
  onPayNow,
  onRefresh,
}: {
  data: DashboardDto;
  onEnter: (registrationId: string) => Promise<void>;
  onPayNow: (reg: RegistrationDto) => void;
  onRefresh: () => Promise<void>;
}) {
  const { t } = useI18n();
  const [enterBusyId, setEnterBusyId] = useState<string | null>(null);
  const [startReg, setStartReg] = useState<RegistrationDto | null>(null);
  const [refundReg, setRefundReg] = useState<RegistrationDto | null>(null);
  const [resubmitReg, setResubmitReg] = useState<RegistrationDto | null>(null);
  const [refundBusy, setRefundBusy] = useState(false);
  const [resubmitBusy, setResubmitBusy] = useState(false);
  const [resubmitError, setResubmitError] = useState('');
  const [eligibilityType, setEligibilityType] = useState('');
  const [selectedCertKey, setSelectedCertKey] = useState<'ALL' | string>('ALL');
  const resubmitFileRef = useRef<HTMLInputElement>(null);

  const upcomingMine = data.registrations
    .filter((r) => {
      if (r.status === 'CANCELLED' || r.status === 'REFUNDED') return false;
      if (r.status === 'EXAM_COMPLETED') return false;
      if (r.attemptsExhausted) return false;
      if (r.status !== 'PAID') return false;
      if (r.examDeadlineExpired) return false;
      return true;
    })
    .sort(
      (a, b) =>
        new Date(a.schedule.examDate).getTime() - new Date(b.schedule.examDate).getTime(),
    );

  const certOptions = useMemo(() => {
    const seen = new Set<string>();
    const opts: Array<{ key: string; label: string }> = [];
    const levelOrder: Record<string, number> = { L3: 0, L2: 1, L1: 2 };
    for (const r of upcomingMine) {
      const key = `${r.certType}__${r.level}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const certName = String(r.certType).replace(/_/g, '-');
      opts.push({ key, label: `${certName} ${r.level}` });
    }
    return opts.sort((a, b) => {
      const [aCert, aLevel = 'L3'] = a.label.split(' ');
      const [bCert, bLevel = 'L3'] = b.label.split(' ');
      if (aCert !== bCert) return aCert.localeCompare(bCert);
      return (levelOrder[aLevel] ?? 99) - (levelOrder[bLevel] ?? 99);
    });
  }, [upcomingMine]);

  const filteredUpcomingMine = useMemo(() => {
    if (selectedCertKey === 'ALL') return upcomingMine;
    return upcomingMine.filter((r) => `${r.certType}__${r.level}` === selectedCertKey);
  }, [upcomingMine, selectedCertKey]);

  const selectedCertLabel = useMemo(() => {
    if (selectedCertKey === 'ALL') return t('mypage.exams.filterAll');
    return certOptions.find((o) => o.key === selectedCertKey)?.label ?? t('mypage.exams.filterAll');
  }, [certOptions, selectedCertKey, t]);

  const myScheduleIds = new Set(data.registrations.map((r) => r.schedule.id));
  const openSessions = data.upcomingSchedules.filter(
    (s) => !myScheduleIds.has(s.id) && s.status === 'REGISTRATION_OPEN',
  );
  const openCount = openSessions.length;

  const handleEnter = async (registrationId: string) => {
    setEnterBusyId(registrationId);
    try {
      await onEnter(registrationId);
    } finally {
      setEnterBusyId(null);
    }
  };

  const handleStartExam = async () => {
    if (!startReg) return;
    const reg = startReg;
    const gate = registrationExamEntryState(reg);
    if (!gate.canEnter) return;
    // 시험응시 버튼 클릭(유저 제스처)에서 선행 fullscreen 진입.
    // 이후 단계에서 guard가 유지/복구를 담당한다.
    const el = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
      msRequestFullscreen?: () => Promise<void> | void;
    };
    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        await el.msRequestFullscreen();
      }
    } catch {
      /* ignore */
    }
    setStartReg(null);
    await handleEnter(reg.id);
  };

  const handleEligibilityRefund = async () => {
    if (!refundReg) return;
    setRefundBusy(true);
    try {
      await registrationsApi.eligibilityRefund(refundReg.id);
      window.alert(t('mypage.exams.alert.refundOk'));
      setRefundReg(null);
      await onRefresh();
    } catch (e: unknown) {
      const msg = isAxiosError(e) ? e.response?.data?.message : undefined;
      window.alert(typeof msg === 'string' && msg ? msg : t('mypage.exams.alert.refundFail'));
    } finally {
      setRefundBusy(false);
    }
  };

  const openResubmit = (reg: RegistrationDto) => {
    setResubmitError('');
    setEligibilityType('');
    setResubmitReg(reg);
  };

  const handleResubmitDoc = async (file: File) => {
    if (!resubmitReg || !eligibilityType) {
      setResubmitError(t('mypage.exams.alert.basisRequired'));
      return;
    }
    setResubmitBusy(true);
    setResubmitError('');
    try {
      await registrationsApi.uploadDocument(resubmitReg.id, file, eligibilityType);
      window.alert(t('mypage.exams.alert.uploadOk'));
      setResubmitReg(null);
      await onRefresh();
    } catch (e: unknown) {
      const msg = isAxiosError(e) ? e.response?.data?.message : undefined;
      setResubmitError(typeof msg === 'string' && msg ? msg : t('mypage.exams.alert.uploadFail'));
    } finally {
      setResubmitBusy(false);
    }
  };

  const refundAmountLabel = (reg: RegistrationDto) =>
    `KRW ${(reg.latestPayment?.amount ?? reg.fee ?? 0).toLocaleString()}`;

  // 데스크톱 테이블/모바일 카드가 같은 액션 버튼 세트를 공유한다.
  // mobile=true일 때만 full-width 클래스로 바뀌며 로직은 동일하다.
  const renderRowActions = (
    r: RegistrationDto,
    state: ReturnType<typeof registrationExamEntryState>,
    mobile: boolean,
  ) => {
    const voucherLabel = t('mypage.act.voucher' as never);
    const cls = (desktop: string) => (mobile ? 'w-full min-h-[44px]' : desktop);
    const voucherCls = mobile ? 'w-full min-h-[44px]' : 'btn-sm min-w-[88px]';
    if (r.status !== 'PAID') {
      return (
        <Btn variant="orange" className={cls('btn-sm')} onClick={() => onPayNow(r)}>
          Pay Now
        </Btn>
      );
    }
    if (state.gate === 'eligibility_rejected') {
      return (
        <>
          {!r.eligibilityRefundRequested && (
            <Btn
              variant="primary"
              className={cls('btn-sm min-w-[108px]')}
              onClick={() => openResubmit(r)}
            >
              {t('mypage.exams.act.resubmit')}
            </Btn>
          )}
          {isEligibilityRefundEligible(r) && (
            <Btn
              variant="default"
              className={cls('btn-sm min-w-[96px]')}
              disabled={refundBusy && refundReg?.id === r.id}
              onClick={() => setRefundReg(r)}
            >
              {t('mypage.exams.act.refund100')}
            </Btn>
          )}
          <VoucherButton regId={r.id} label={voucherLabel} className={voucherCls} />
        </>
      );
    }
    if (state.gate === 'eligibility_pending') {
      return (
        <>
          {isEligibilityRefundEligible(r) && (
            <Btn
              variant="default"
              className={cls('btn-sm min-w-[96px]')}
              disabled={refundBusy && refundReg?.id === r.id}
              onClick={() => setRefundReg(r)}
            >
              {t('mypage.exams.act.refund100')}
            </Btn>
          )}
          <VoucherButton regId={r.id} label={voucherLabel} className={voucherCls} />
        </>
      );
    }
    if (state.gate === 'eligibility_missing_doc') {
      return (
        <>
          {!r.eligibilityRefundRequested && (
            <Btn
              variant="primary"
              className={cls('btn-sm min-w-[96px]')}
              onClick={() => openResubmit(r)}
            >
              {t('mypage.exams.act.submitDoc')}
            </Btn>
          )}
          {isEligibilityRefundEligible(r) && (
            <Btn
              variant="default"
              className={cls('btn-sm min-w-[96px]')}
              disabled={refundBusy && refundReg?.id === r.id}
              onClick={() => setRefundReg(r)}
            >
              {t('mypage.exams.act.refund100')}
            </Btn>
          )}
          <VoucherButton regId={r.id} label={voucherLabel} className={voucherCls} />
        </>
      );
    }
    return (
      <>
        <Btn
          variant="primary"
          className={cls('btn-sm min-w-[96px]')}
          disabled={!state.canEnter || enterBusyId === r.id}
          title={state.hint}
          onClick={() => setStartReg(r)}
        >
          {enterBusyId === r.id ? '…' : t('mypage.exams.act.startExam')}
        </Btn>
        <VoucherButton regId={r.id} label={voucherLabel} className={voucherCls} />
      </>
    );
  };

  return (
    <>
      <SectionTitle title={t('sec.schedule.title')} sub="" />

     {/*  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <span className="text-[15px] font-semibold text-ink tracking-[-0.01em]">Confirmed Exams</span>
        <button
          onClick={() => navigate('/apply')}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-[13px] font-semibold bg-blue text-white hover:bg-[#0052CC] transition-all cursor-pointer"
          style={{ fontFamily: 'inherit' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Register New Exam
          {openCount > 0 && (
            <span className="ml-1 bg-white text-blue text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {openCount}
            </span>
          )}
        </button>
      </div> */}

      <InfoCallout tone="blue" className="">
            <p>
              수험표는 시험 시작 전까지 출력할 수 있으며, 시험 당일 입장 시 수험번호와 본인확인이 필요합니다.
            </p>
      </InfoCallout>

      <div className="mb-3 flex items-center justify-end">
        <label className="relative block w-full sm:w-[160px] sm:min-w-[160px]">
          <select
            value={selectedCertKey}
            onChange={(e) => setSelectedCertKey(e.target.value)}
            className="h-11 sm:h-[40px] w-full appearance-none rounded-none border border-gray-200 bg-white pl-3 pr-10 text-[16px] leading-none  outline-none"
            aria-label={t('mypage.exams.filterAria')}
          >
            <option value="ALL">{t('mypage.exams.filterAll')}</option>
            {certOptions.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#1D6FE5]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 9 7 7 7-7" />
            </svg>
          </span>
        </label>
      </div>

      <div className={TABLE_WRAP}>
        <table className="data-table" style={{ minWidth: 1020 }}>
          <thead>
            <tr>
              <th style={{ width: 180 }}>{t('mypage.exams.col.cert')}</th>
              <th style={{ width: 88 }}>{t('mypage.exams.col.round')}</th>
              <th style={{ width: 280 }}>{t('mypage.exams.col.status')}</th>
              <th style={{ width: 160 }}>{t('mypage.exams.col.examDate')}</th>
              <th style={{ width: 340 }} className="text-right">
                {t('mypage.exams.col.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUpcomingMine.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState description={t('mypage.exams.empty', { cert: selectedCertLabel })}>
                    —
                  </EmptyState>
                </td>
              </tr>
            ) : (
              filteredUpcomingMine.map((r) => {
                const state = registrationExamEntryState(r);
                return (
                  <tr key={r.id}>
                    <td>
                      <span className="text-ink font-semibold">
                        {certLabel(r.certType, r.level)}
                      </span>
                    </td>
                    <td className="text-muted font-en">
                      {t('mypage.exams.round', { n: r.schedule.roundNumber })}
                    </td>
                    <td>
                      <ExamStatusCell
                        r={r}
                        gate={state.gate}
                        deadlineExpired={r.examDeadlineExpired}
                      />
                    </td>
                    <td className="text-muted text-[13px]">
                      {formatExamDate(r.schedule.examDate, r.schedule.examStartTime)}
                    </td>
                    <td className="text-right">
                      <div className="inline-flex gap-2 flex-wrap justify-end items-center">
                        {renderRowActions(r, state, false)}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden mt-4 border-t-2 border-ink">
        {filteredUpcomingMine.length === 0 ? (
          <EmptyState description={t('mypage.exams.empty', { cert: selectedCertLabel })}>
            —
          </EmptyState>
        ) : (
          filteredUpcomingMine.map((r) => {
            const state = registrationExamEntryState(r);
            return (
              <div key={r.id} className="border-b border-border py-4">
                <div className="min-w-0">
                  <div className="text-[11px] text-muted font-en mb-0.5">
                    {t('mypage.exams.round', { n: r.schedule.roundNumber })}
                  </div>
                  <div className="text-[16px] font-semibold text-ink break-keep">
                    {certLabel(r.certType, r.level)}
                  </div>
                </div>
                <div className="mt-2.5">
                  <ExamStatusCell
                    r={r}
                    gate={state.gate}
                    deadlineExpired={r.examDeadlineExpired}
                  />
                </div>
                <div className="mt-2.5 flex justify-between gap-3 text-[13px]">
                  <span className="text-light flex-shrink-0">{t('mypage.exams.col.examDate')}</span>
                  <span className="text-ink text-right break-keep">
                    {formatExamDate(r.schedule.examDate, r.schedule.examStartTime)}
                  </span>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {renderRowActions(r, state, true)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {openCount === 0 && (
        <div className="mt-4">
          <div className="text-[15px] font-semibold text-ink tracking-[-0.01em] mb-3">Open Sessions</div>
          <EmptyState description="새로운 응시 가능 회차가 열리면 이곳에서 바로 확인할 수 있습니다.">
            데이터가 없습니다.
          </EmptyState>
        </div>
      )}

{/*      
      <div className="border border-border rounded-lg p-6 mt-4">
        <div className="text-[15px] font-semibold text-ink tracking-[-0.01em] mb-3">Exam Environment Checklist</div>
        <DetailRow label="Device" value="PC / laptop required (mobile not supported)" />
        <DetailRow label="Browser" value="Chrome 90+ (latest recommended)" />
        <DetailRow label="Camera & Mic" value="Required — AI proctoring system" />
        <DetailRow label="Entry Window" value="Opens 30 min before exam, closes 10 min after start" />
        <div className="mt-4">
          <Btn variant="green" className="w-full" onClick={() => navigate('/env-check')}>
            Full Environment Check Guide
          </Btn>
        </div>
      </div> */}

      {startReg && registrationExamEntryState(startReg).canEnter && (
        <ResultModal
          title={t('mypage.exams.modal.startTitle')}
          onClose={() => setStartReg(null)}
          footer={
            <ResultModalButton
              variant="primary"
              onClick={() => void handleStartExam()}
              disabled={enterBusyId === startReg.id}
            >
              {enterBusyId === startReg.id
                ? t('mypage.exams.act.entering')
                : t('mypage.exams.act.startConfirm')}
            </ResultModalButton>
          }
        >
          <ResultModalInlineText>
            {t('mypage.exams.modal.startBody', {
              cert: certLabel(startReg.certType, startReg.level),
              round: t('mypage.exams.round', { n: startReg.schedule.roundNumber }),
            })}
          </ResultModalInlineText>
          <p className="mt-4 font-bold text-blue-500">{t('mypage.exams.modal.fullscreen')}</p>
        </ResultModal>
      )}

      {refundReg && (
        <ResultModal
          title={t('mypage.exams.modal.refundTitle')}
          onClose={() => !refundBusy && setRefundReg(null)}
          footer={
            <>
              <ResultModalButton variant="default" onClick={() => setRefundReg(null)} disabled={refundBusy}>
                {t('mypage.exams.modal.cancel')}
              </ResultModalButton>
              <ResultModalButton variant="primary" onClick={() => void handleEligibilityRefund()} disabled={refundBusy}>
                {refundBusy ? t('mypage.exams.modal.refundSubmitting') : t('mypage.exams.modal.refundSubmit')}
              </ResultModalButton>
            </>
          }
        >
          <ResultModalInlineText>
            {registrationExamEntryState(refundReg).gate === 'eligibility_rejected'
              ? t('mypage.exams.modal.refundRejected', { amount: refundAmountLabel(refundReg) })
              : registrationExamEntryState(refundReg).gate === 'eligibility_pending'
                ? t('mypage.exams.modal.refundPending', { amount: refundAmountLabel(refundReg) })
                : t('mypage.exams.modal.refundMissing', { amount: refundAmountLabel(refundReg) })}
          </ResultModalInlineText>
          {refundReg.eligibilityNote?.trim() && (
            <div className="mt-4 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">
              <p className="text-[12px] font-semibold text-[#B91C1C] mb-1">
                {t('mypage.exams.modal.refundReason')}
              </p>
              <p className="text-[14px] leading-[1.6] text-[#991B1B]">
                {localizeEligibilityNote(refundReg.eligibilityNote, t)}
              </p>
            </div>
          )}
        </ResultModal>
      )}

      {resubmitReg && (
        <ResultModal
          title={
            registrationExamEntryState(resubmitReg).gate === 'eligibility_rejected'
              ? t('mypage.exams.modal.resubmitTitle')
              : t('mypage.exams.modal.submitTitle')
          }
          onClose={() => !resubmitBusy && setResubmitReg(null)}
          footer={
            <>
              <ResultModalButton variant="default" onClick={() => setResubmitReg(null)} disabled={resubmitBusy}>
                {t('mypage.exams.modal.cancel')}
              </ResultModalButton>
              <ResultModalButton
                variant="primary"
                disabled={resubmitBusy || !eligibilityType}
                onClick={() => resubmitFileRef.current?.click()}
              >
                {resubmitBusy ? t('mypage.exams.modal.uploading') : t('mypage.exams.modal.upload')}
              </ResultModalButton>
            </>
          }
        >
          {resubmitReg.eligibilityNote?.trim() && (
            <div className="mb-4 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">
              <p className="text-[12px] font-semibold text-[#B91C1C] mb-1">
                {t('mypage.examStatus.reasonLabel')}
              </p>
              <p className="text-[14px] leading-[1.6] text-[#991B1B]">
                {localizeEligibilityNote(resubmitReg.eligibilityNote, t)}
              </p>
            </div>
          )}
          <p className="text-[14px] text-body mb-4 leading-[1.65]">
            {registrationExamEntryState(resubmitReg).gate === 'eligibility_rejected'
              ? t('mypage.exams.modal.resubmitBody')
              : t('mypage.exams.modal.submitBody')}
          </p>
          <p className="text-[12px] font-semibold text-ink mb-2">{t('mypage.exams.modal.basisLabel')}</p>
          <div className="grid grid-cols-1 gap-2 mb-4">
            {ELIG_RESUBMIT_OPTION_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setEligibilityType(id)}
                className={`px-4 py-3 text-left text-[14px] border rounded-lg transition-colors cursor-pointer ${
                  eligibilityType === id
                    ? 'border-blue bg-[#EFF6FF] font-semibold text-[#1D4ED8] ring-1 ring-blue/30'
                    : 'border-[#E5E7EB] hover:bg-[#F9FAFB] text-ink'
                }`}
              >
                {t(ELIG_OPTION_I18N[id])}
              </button>
            ))}
          </div>
          <input
            ref={resubmitFileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) void handleResubmitDoc(file);
            }}
          />
          {resubmitError && (
            <p className="text-[13px] text-status-danger" role="alert">{resubmitError}</p>
          )}
        </ResultModal>
      )}
    </>
  );
}
