import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { examApi } from '../services/api';

type Result = {
  id: string;
  certType: string;
  level: string;
  status: string;
  submittedAt: string | null;
  writtenScore: number | null;
  practicalScore: number | null;
  totalScore: number | null;
  passed: boolean | null;
  failReason: string | null;
  breakdown: { id: string; part: string; subjectName: string; earned: number; total: number; percentage: number; subjectFailed: boolean }[];
};

export default function ExamResultPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [r, setR] = useState<Result | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) return;
    examApi
      .result(sessionId)
      .then((res) => setR(res.data))
      .catch((e) => setError(e.response?.data?.message || 'Failed to load result'));
  }, [sessionId]);

  if (error) return <div className="p-8 text-red-700">{error}</div>;
  if (!r) return <div className="p-8 text-gray-600">Loading result…</div>;

  const isPassed = r.passed === true;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <button onClick={() => navigate('/cbt')} className="text-sm text-gray-600 mb-4">← Back to exam list</button>

        <div className={`rounded-xl p-6 mb-6 ${isPassed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="text-sm uppercase tracking-wide text-gray-500">{r.certType.replace('_', '-')} · {r.level}</div>
          <div className={`text-4xl font-extrabold mt-2 ${isPassed ? 'text-green-700' : 'text-red-700'}`}>
            {isPassed ? 'PASS' : 'FAIL'}
          </div>
          {r.failReason && <div className="text-sm text-red-700 mt-2">{r.failReason}</div>}
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <Metric label="Total" value={r.totalScore} />
            <Metric label="Written" value={r.writtenScore} />
            <Metric label="Practical" value={r.practicalScore} />
          </div>
        </div>

        <h2 className="text-lg font-bold mb-3">Subject breakdown</h2>
        <div className="space-y-2">
          {r.breakdown.map((b) => (
            <div key={b.id} className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3">
              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">{b.part}</span>
              <div className="flex-1">
                <div className="text-sm font-semibold">{b.subjectName}</div>
                <div className="h-1.5 bg-gray-100 rounded mt-1">
                  <div
                    className={`h-full rounded ${b.subjectFailed ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${b.percentage}%` }}
                  />
                </div>
              </div>
              <div className="text-sm font-mono text-gray-700 w-20 text-right">
                {b.earned}/{b.total}
              </div>
              <div className="text-sm font-bold w-12 text-right">{b.percentage}%</div>
              {b.subjectFailed && <span className="text-xs text-red-600">FAIL</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <div className="text-xs text-gray-500 uppercase">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value == null ? '—' : `${value}%`}</div>
    </div>
  );
}
