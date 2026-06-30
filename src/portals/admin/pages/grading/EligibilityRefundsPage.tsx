import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import {
  Card,
  PageHeader,
  SectionHeader,
  Button,
  Chip,
  type ChipTone,
  Tabs,
  TabItem,
  TableWrap,
  Table,
  Th,
  Td,
  CertTag,
  certCodeOf,
  pushToast,
} from '@admin/components/shared/ui-kit';
import { adminApi, type EligibilityRefundRow } from '@admin/services/api';
import { AxiosError } from 'axios';

type StatusTab = 'PENDING' | 'ALL';

const ELIG_STATUS: Record<string, { label: string; tone: ChipTone }> = {
  PENDING: { label: '서류 검토중', tone: 'amber' },
  REJECTED: { label: '서류 반려', tone: 'red' },
  NOT_REQUIRED: { label: '서류 미제출', tone: 'gray' },
  APPROVED: { label: '승인됨', tone: 'green' },
};

function formatKrw(n: number) {
  return `KRW ${n.toLocaleString()}`;
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
}

export default function EligibilityRefundsPage() {
  const [tab, setTab] = useState<StatusTab>('PENDING');
  const [rows, setRows] = useState<EligibilityRefundRow[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    setRows(null);
    adminApi
      .getEligibilityRefundQueue(tab)
      .then((r) => setRows(r.data))
      .catch(() => pushToast('환불 요청 목록을 불러오지 못했습니다', 'red'));
  }, [tab, reloadKey]);

  const approve = async (registrationId: string) => {
    if (!window.confirm('100% 환불을 실행합니다. 되돌릴 수 없습니다. 계속하시겠습니까?')) return;
    setBusyId(registrationId);
    try {
      const res = await adminApi.approveEligibilityRefund(registrationId);
      pushToast(
        `환불 완료 (${formatKrw(res.data.refundAmount)})`,
        'green',
      );
      reload();
    } catch (e) {
      const msg = (e as AxiosError<{ message?: string }>)?.response?.data?.message;
      pushToast(msg || '환불 처리 실패', 'red');
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (registrationId: string) => {
    const note = window.prompt('반려 사유 (응시자에게 안내 가능):') ?? undefined;
    if (note === undefined) return;
    setBusyId(registrationId);
    try {
      await adminApi.rejectEligibilityRefund(registrationId, note || undefined);
      pushToast('환불 요청이 반려되었습니다', 'orange');
      reload();
    } catch (e) {
      const msg = (e as AxiosError<{ message?: string }>)?.response?.data?.message;
      pushToast(msg || '처리 실패', 'red');
    } finally {
      setBusyId(null);
    }
  };

  const tabItems: TabItem<StatusTab>[] = [
    { id: 'PENDING', label: '처리 대기' },
    { id: 'ALL', label: '전체' },
  ];

  return (
    <div>
      <PageHeader
        title="L1 환불 요청"
        subtitle="응시자가 마이페이지에서 신청한 AXIS-C L1 100% 환불 요청입니다. 승인 시 결제가 취소되고 접수가 종료됩니다."
      />

      <Card className="p-5">
        <SectionHeader title="환불 요청 목록" subtitle={rows ? `${rows.length}건` : ''} />
        <div className="mb-4">
          <Tabs tabs={tabItems} active={tab} onChange={setTab} />
        </div>

        {!rows ? (
          <div className="py-12 flex justify-center text-[var(--gray-400)]">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-[var(--gray-500)] text-[14px]">
            {tab === 'PENDING' ? '대기 중인 환불 요청이 없습니다.' : '환불 요청 내역이 없습니다.'}
          </div>
        ) : (
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th align="left">응시자</Th>
                  <Th>자격</Th>
                  <Th>자격 상태</Th>
                  <Th align="right">환불 금액</Th>
                  <Th>요청일</Th>
                  <Th>상태</Th>
                  <Th align="right">처리</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const elig = ELIG_STATUS[r.eligibilityStatus] ?? {
                    label: r.eligibilityStatus,
                    tone: 'gray' as ChipTone,
                  };
                  const pending = r.status === 'PENDING';
                  const busy = busyId === r.registrationId;
                  return (
                    <tr key={r.registrationId}>
                      <Td align="left">
                        <div className="font-medium text-[var(--gray-800)]">{r.userName}</div>
                        <div className="text-[12px] text-[var(--gray-500)]">{r.userEmail ?? '—'}</div>
                        {r.candidateNote && (
                          <div className="text-[12px] text-[var(--gray-600)] mt-1 max-w-[220px]">
                            요청 메모: {r.candidateNote}
                          </div>
                        )}
                      </Td>
                      <Td>
                        <CertTag code={certCodeOf(r.certType)} />
                        <span className="text-[12px] text-[var(--gray-500)] ml-1">{r.level}</span>
                        <div className="text-[12px] text-[var(--gray-500)] mt-1">{r.roundNumber}회</div>
                      </Td>
                      <Td>
                        <Chip tone={elig.tone}>{elig.label}</Chip>
                        {r.eligibilityNote && (
                          <div className="text-[11px] text-[var(--gray-500)] mt-1 max-w-[180px] line-clamp-2">
                            {r.eligibilityNote}
                          </div>
                        )}
                      </Td>
                      <Td align="right" className="font-en font-semibold">
                        {formatKrw(r.amount)}
                      </Td>
                      <Td className="text-[13px] text-[var(--gray-600)]">
                        {formatWhen(r.requestedAt)}
                      </Td>
                      <Td>
                        <Chip
                          tone={
                            r.status === 'PENDING'
                              ? 'amber'
                              : r.status === 'APPROVED'
                                ? 'green'
                                : 'red'
                          }
                        >
                          {r.status === 'PENDING'
                            ? '환불 대기'
                            : r.status === 'APPROVED'
                              ? '환불 완료'
                              : '요청 반려'}
                        </Chip>
                      </Td>
                      <Td align="right">
                        {pending ? (
                          <div className="inline-flex gap-2">
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={busy}
                              onClick={() => void approve(r.registrationId)}
                            >
                              {busy ? '…' : '환불 승인'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={busy}
                              onClick={() => void reject(r.registrationId)}
                            >
                              반려
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[12px] text-[var(--gray-400)]">—</span>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableWrap>
        )}
      </Card>
    </div>
  );
}
