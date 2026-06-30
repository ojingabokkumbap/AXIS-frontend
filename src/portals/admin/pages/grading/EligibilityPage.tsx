import { useEffect, useState } from 'react';
import { Loader2, FileText, CheckCircle2, XCircle, Download, ExternalLink } from 'lucide-react';
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
import { adminApi, type EligibilityRow } from '@admin/services/api';
import { AxiosError } from 'axios';
import {
  ELIG_REJECT_REASONS,
  encodeEligibilityRejectNote,
  type EligibilityRejectCode,
} from '@admin/constants/eligibilityRejectReasons';

type StatusTab = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

const ELIG_TYPE_LABEL: Record<string, string> = {
  L2_CERT: 'L2 자격 취득',
  MANAGER_EXP: '2년 이상 관리 경력',
  MGMT_2Y: '2년 이상 관리 경력',
  PREP_COURSE: 'L1 준비교육 이수',
  AX_LEADER_COURSE: 'AX 리더 교육 이수',
};

const STATUS_META: Record<string, { label: string; tone: ChipTone }> = {
  PENDING: { label: '검토 대기', tone: 'amber' },
  APPROVED: { label: '승인됨', tone: 'green' },
  REJECTED: { label: '반려됨', tone: 'red' },
  NOT_REQUIRED: { label: '미제출', tone: 'gray' },
};

function statusMeta(s: string) {
  return STATUS_META[s] ?? { label: s, tone: 'gray' as ChipTone };
}

async function fetchEligibilityDoc(registrationId: string) {
  const res = await adminApi.getEligibilityDoc(registrationId);
  if (!res.data.url) return null;
  return { url: res.data.url, fileName: res.data.fileName ?? 'eligibility-document' };
}

export default function EligibilityPage() {
  const [tab, setTab] = useState<StatusTab>('ALL');
  const [rows, setRows] = useState<EligibilityRow[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectCode, setRejectCode] = useState<EligibilityRejectCode>('INSUFFICIENT_PROOF');
  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    setRows(null);
    adminApi
      .getEligibilityQueue(tab === 'ALL' ? undefined : tab)
      .then((r) => setRows(r.data))
      .catch(() => pushToast('목록을 불러오지 못했습니다', 'red'));
  }, [tab, reloadKey]);

  const viewDoc = async (registrationId: string) => {
    try {
      const doc = await fetchEligibilityDoc(registrationId);
      if (!doc) {
        pushToast('첨부된 서류가 없습니다', 'orange');
        return;
      }
      window.open(doc.url, '_blank', 'noopener');
    } catch {
      pushToast('서류를 열 수 없습니다', 'red');
    }
  };

  const downloadDoc = async (registrationId: string, fallbackName?: string | null) => {
    try {
      const doc = await fetchEligibilityDoc(registrationId);
      if (!doc) {
        pushToast('첨부된 서류가 없습니다', 'orange');
        return;
      }
      const response = await fetch(doc.url);
      if (!response.ok) throw new Error('fetch failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName || fallbackName || 'eligibility-document';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      pushToast('다운로드에 실패했습니다', 'red');
    }
  };

  const review = async (
    registrationId: string,
    decision: 'APPROVED' | 'REJECTED',
    note?: string,
  ) => {
    setBusyId(registrationId);
    try {
      await adminApi.reviewEligibility(registrationId, decision, note);
      pushToast(
        decision === 'APPROVED'
          ? '승인되었습니다 — 응시자가 실제 시험에 응시할 수 있습니다'
          : '반려되었습니다',
        decision === 'APPROVED' ? 'green' : 'orange',
      );
      reload();
    } catch (e) {
      const msg = (e as AxiosError<{ message?: string }>)?.response?.data?.message;
      pushToast(msg || '처리 실패', 'red');
    } finally {
      setBusyId(null);
    }
  };

  const submitReject = async () => {
    if (!rejectTarget) return;
    const note = encodeEligibilityRejectNote(rejectCode);
    setRejectTarget(null);
    await review(rejectTarget, 'REJECTED', note);
  };

  const tabItems: TabItem<StatusTab>[] = [
    { id: 'ALL', label: '전체' },
    { id: 'PENDING', label: '검토 대기' },
    { id: 'APPROVED', label: '승인됨' },
    { id: 'REJECTED', label: '반려됨' },
  ];

  return (
    <div>
      <PageHeader
        title="L1 응시자격 검토"
        subtitle="AXIS-C L1 응시자가 제출한 자격 증빙 서류를 검토하고 승인합니다. 승인 전까지 응시자는 데모만 응시할 수 있고, 승인 후 실제 시험에 응시할 수 있습니다."
      />

      <Card className="p-5">
        <SectionHeader title="자격 서류 목록" subtitle={rows ? `${rows.length}건` : ''} />
        <div className="mb-4">
          <Tabs tabs={tabItems} active={tab} onChange={setTab} />
        </div>

        {!rows ? (
          <div className="py-12 flex justify-center text-[var(--gray-400)]">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-[var(--gray-500)] text-[14px]">
            해당 상태의 서류가 없습니다.
          </div>
        ) : (
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th align="left">응시자</Th>
                  <Th>자격</Th>
                  <Th align="left">제출 근거</Th>
                  <Th>서류</Th>
                  <Th>상태</Th>
                  <Th align="right">처리</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const meta = statusMeta(r.eligibilityStatus);
                  const pending = r.eligibilityStatus === 'PENDING';
                  const busy = busyId === r.registrationId;
                  return (
                    <tr key={r.registrationId} className="hover:bg-[var(--gray-50)] transition-colors">
                      <Td align="left">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--blue-50)] text-[var(--primary)] text-[12px] font-bold">
                            {r.candidate?.[0] ?? '?'}
                          </span>
                          <span className="flex flex-col leading-tight">
                            <span className="font-medium text-[var(--gray-900)]">{r.candidate}</span>
                            <span className="text-[11px] text-[var(--gray-400)]">@{r.candidateUserId}</span>
                          </span>
                        </div>
                      </Td>
                      <Td>
                        <span className="inline-flex items-center gap-1">
                          <CertTag code={certCodeOf(r.certType)} />
                          <span className="text-[var(--gray-600)]">{r.level}</span>
                        </span>
                      </Td>
                      <Td align="left" muted>
                        {r.eligibilityType ? (ELIG_TYPE_LABEL[r.eligibilityType] ?? r.eligibilityType) : '—'}
                      </Td>
                      <Td>
                        {r.hasDocument ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[11px] text-[var(--gray-500)] max-w-[140px] truncate">
                              {r.documentFileName ?? '첨부됨'}
                            </span>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => viewDoc(r.registrationId)}
                                className="inline-flex items-center gap-1 rounded-md border border-[var(--gray-border)] px-2 py-1 text-[12px] text-[var(--blue)] hover:bg-[var(--blue-50)] transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" /> 보기
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadDoc(r.registrationId, r.documentFileName)}
                                className="inline-flex items-center gap-1 rounded-md border border-[var(--gray-border)] px-2 py-1 text-[12px] text-[var(--gray-700)] hover:bg-[var(--gray-50)] transition-colors"
                              >
                                <Download className="w-3 h-3" /> 다운로드
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[var(--gray-300)]">미첨부</span>
                        )}
                      </Td>
                      <Td>
                        <Chip tone={meta.tone}>{meta.label}</Chip>
                      </Td>
                      <Td align="right">
                        {pending ? (
                          <div className="flex gap-1.5 justify-end">
                            <Button
                              size="sm"
                              onClick={() => review(r.registrationId, 'APPROVED')}
                              disabled={busy || !r.hasDocument}
                              title={!r.hasDocument ? '서류가 첨부되어야 승인할 수 있습니다' : undefined}
                            >
                              {busy ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              승인
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setRejectCode('INSUFFICIENT_PROOF');
                                setRejectTarget(r.registrationId);
                              }}
                              disabled={busy}
                            >
                              <XCircle className="w-3.5 h-3.5" /> 반려
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[12px] text-[var(--gray-400)]">
                            {r.reviewedAt ? new Date(r.reviewedAt).toLocaleDateString() : '—'}
                          </span>
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

      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl border border-[var(--gray-border)] p-6">
            <h3 className="text-[18px] font-semibold text-[var(--gray-900)] mb-1">서류 반려</h3>
            <p className="text-[13px] text-[var(--gray-500)] mb-4 leading-[1.6]">
              반려 사유는 응시자 마이페이지에 한국어·영어로 표시됩니다.
            </p>
            <label className="block text-[12px] font-semibold text-[var(--gray-700)] mb-2">
              반려 사유
            </label>
            <select
              value={rejectCode}
              onChange={(e) => setRejectCode(e.target.value as EligibilityRejectCode)}
              className="w-full h-10 rounded-lg border border-[var(--gray-border)] px-3 text-[14px] mb-5"
            >
              {ELIG_REJECT_REASONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setRejectTarget(null)}>
                취소
              </Button>
              <Button variant="danger" onClick={() => void submitReject()}>
                반려 확인
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
