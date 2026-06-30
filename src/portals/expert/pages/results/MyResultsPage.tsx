import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CertTag,
  certCodeOf,
  PageHeader,
  SimpleKpiCard,
  Table,
  TableWrap,
  Td,
  Th,
} from '@expert/components/shared/ui-kit';
import { expertApi, type GradingRow } from '@expert/services/api';
import { getStoredExpertUser } from '@expert/utils/auth';

export default function MyResultsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<GradingRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const me = useMemo(() => getStoredExpertUser(), []);

  useEffect(() => {
    let cancelled = false;
    expertApi
      .getQueue('final')
      .then((r) => {
        if (cancelled) return;
        const mine = me ? r.data.filter((x) => x.assignedExpertId === me.id) : r.data;
        setRows(mine);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.response?.data?.message ?? '결과를 불러오지 못했습니다');
      });
    return () => {
      cancelled = true;
    };
  }, [me]);

  const passCount = (rows ?? []).filter((r) => r.result === 'pass').length;
  const failCount = (rows ?? []).filter((r) => r.result === 'fail').length;

  return (
    <div>
      <PageHeader
        title="확정 결과"
        subtitle="내가 채점하여 확정한 세션 기록입니다. 행을 클릭하면 상세 점수를 다시 볼 수 있습니다."
      />

      <div className="grid grid-cols-3 gap-3.5 mb-5">
        <SimpleKpiCard label="확정 건수" value={rows?.length ?? '—'} unit="건" />
        <SimpleKpiCard label="합격" value={passCount} unit="명" />
        <SimpleKpiCard label="불합격" value={failCount} unit="명" />
      </div>

      {error && (
        <Card className="p-4 mb-4 border-rose-200 bg-rose-50/40 text-sm text-rose-700">
          {error}
        </Card>
      )}

      <TableWrap>
        <Table>
          <thead>
            <tr>
              <Th>세션</Th>
              <Th>응시자</Th>
              <Th>자격</Th>
              <Th>등급</Th>
              <Th>회차</Th>
              <Th align="right">필기</Th>
              <Th>결과</Th>
              <Th>상세</Th>
            </tr>
          </thead>
          <tbody>
            {rows === null && (
              <tr>
                <Td colSpan={8} className="!text-center !text-[var(--gray-400)] !py-12">
                  불러오는 중…
                </Td>
              </tr>
            )}
            {rows !== null && rows.length === 0 && (
              <tr>
                <Td colSpan={8} className="!text-center !text-[var(--gray-400)] !py-12">
                  아직 확정한 결과가 없습니다.
                </Td>
              </tr>
            )}
            {(rows ?? []).map((r) => (
              <tr
                key={r.sessionId}
                onClick={() => navigate(`/sessions/${r.sessionId}`)}
                className="hover:bg-[var(--gray-50)] cursor-pointer"
              >
                <Td mono>{r.sessionId.slice(-12)}</Td>
                <Td strong>{r.candidate}</Td>
                <Td>
                  <CertTag code={certCodeOf(r.certType)} />
                </Td>
                <Td strong>{r.level}</Td>
                <Td>{r.roundNumber != null ? `${r.roundNumber}회차` : '—'}</Td>
                <Td align="right" className="tabular-nums" strong>
                  {r.writtenScore != null ? `${r.writtenScore}점` : '—'}
                </Td>
                <Td>
                  {r.result === 'pass' ? (
                    <span className="text-[var(--green)] font-semibold">합격</span>
                  ) : r.result === 'fail' ? (
                    <span className="text-[var(--gray-600)]">불합격</span>
                  ) : (
                    <span className="text-[var(--gray-300)]">—</span>
                  )}
                </Td>
                <Td muted>보기</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </div>
  );
}
