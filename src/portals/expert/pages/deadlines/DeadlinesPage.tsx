import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, CalendarCheck } from 'lucide-react';
import {
  Button,
  Card,
  CertTag,
  certCodeOf,
  PageHeader,
  SectionHeader,
  Table,
  TableWrap,
  Td,
  Th,
} from '@expert/components/shared/ui-kit';
import { expertApi, type GradingRow } from '@expert/services/api';

function ddayLabel(daysToDue: number, overdue: boolean): string {
  if (overdue) return `D+${Math.abs(daysToDue)}`;
  if (daysToDue <= 0) return 'D-day';
  return `D-${daysToDue}`;
}

export default function DeadlinesPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<GradingRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    expertApi
      .getQueue('all')
      .then((r) => {
        if (cancelled) return;
        const pending = r.data.filter((x) => x.practicalState !== 'final');
        setRows(pending);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.response?.data?.message ?? '마감 일정 로딩 실패');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { overdue, dueSoon, upcoming } = useMemo(() => {
    const sorted = [...(rows ?? [])].sort((a, b) => a.daysToDue - b.daysToDue);
    return {
      overdue: sorted.filter((r) => r.overdue),
      dueSoon: sorted.filter((r) => !r.overdue && r.daysToDue <= 3),
      upcoming: sorted.filter((r) => !r.overdue && r.daysToDue > 3),
    };
  }, [rows]);

  return (
    <div>
      <PageHeader
        title="마감 일정"
        subtitle="AXIS 운영규정상 채점 SLA는 14일입니다. 지연된 항목은 즉시 처리해 주세요."
      />

      {error && (
        <Card className="p-4 mb-4 border-rose-200 bg-rose-50/40 text-sm text-rose-700">
          {error}
        </Card>
      )}

      <Group
        title="지연 (Overdue)"
        icon={<AlertTriangle className="w-4 h-4 text-[var(--red)]" />}
        tone="red"
        rows={overdue}
        navigate={navigate}
        emptyText="지연된 채점이 없습니다. 훌륭합니다."
      />

      <Group
        title="3일 이내 마감"
        icon={<Clock className="w-4 h-4 text-[var(--orange)]" />}
        tone="orange"
        rows={dueSoon}
        navigate={navigate}
        emptyText="3일 이내 마감 항목 없음"
      />

      <Group
        title="예정"
        icon={<CalendarCheck className="w-4 h-4 text-[var(--gray-500)]" />}
        tone="gray"
        rows={upcoming}
        navigate={navigate}
        emptyText="예정된 채점이 없습니다."
      />
    </div>
  );
}

function Group({
  title,
  icon,
  tone,
  rows,
  navigate,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  tone: 'red' | 'orange' | 'gray';
  rows: GradingRow[];
  navigate: (path: string) => void;
  emptyText: string;
}) {
  const bg =
    tone === 'red'
      ? 'border-rose-200 bg-rose-50/40'
      : tone === 'orange'
      ? 'border-amber-200 bg-amber-50/40'
      : 'border-slate-200';

  return (
    <Card className={`p-4 mb-4 ${bg}`}>
      <SectionHeader
        title={
          <span className="inline-flex items-center gap-2">
            {icon} {title} <span className="text-[var(--gray-400)]">({rows.length})</span>
          </span>
        }
      />
      {rows.length === 0 ? (
        <div className="py-6 text-center text-[var(--gray-400)] text-sm">{emptyText}</div>
      ) : (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>D-Day</Th>
                <Th>마감일</Th>
                <Th>응시자</Th>
                <Th>자격</Th>
                <Th>등급</Th>
                <Th>회차</Th>
                <Th>실기 상태</Th>
                <Th align="right">동작</Th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {rows.map((r) => (
                <tr key={r.sessionId} className="bg-white hover:bg-[var(--gray-50)]">
                  <Td
                    className={`tabular-nums ${
                      r.overdue
                        ? '!text-[var(--red)] font-semibold'
                        : r.daysToDue <= 1
                        ? '!text-[var(--red)] font-medium'
                        : ''
                    }`}
                  >
                    {ddayLabel(r.daysToDue, r.overdue)}
                    {r.mandatoryReview && (
                      <span className="ml-1.5 inline-flex items-center text-[10px] text-[var(--red)] bg-rose-50 border border-rose-200 rounded px-1 py-0.5">
                        필수
                      </span>
                    )}
                  </Td>
                  <Td muted>{new Date(r.dueDate).toLocaleDateString()}</Td>
                  <Td strong className="!text-[var(--gray-900)]">
                    {r.candidate}
                  </Td>
                  <Td>
                    <CertTag code={certCodeOf(r.certType)} />
                  </Td>
                  <Td strong className="!text-[var(--gray-900)]">
                    {r.level}
                  </Td>
                  <Td className="!text-[var(--gray-700)]">
                    {r.roundNumber != null ? `${r.roundNumber}회차` : '—'}
                  </Td>
                  <Td muted>{r.practicalState}</Td>
                  <Td align="right">
                    <Button
                      variant="blue"
                      size="sm"
                      onClick={() => navigate(`/sessions/${r.sessionId}`)}
                    >
                      채점하기
                    </Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )}
    </Card>
  );
}
