import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { examApi, type CertType, type CertLevel } from '../services/api';

const CERTS: { type: CertType; name: string; desc: string; color: string }[] = [
  { type: 'AXIS', name: 'AXIS — AI Practical', desc: 'General AI competency for office workers.', color: '#185FA5' },
  { type: 'AXIS_C', name: 'AXIS-C — AI Coding', desc: 'AI coding & automation competency.', color: '#3B6D11' },
  { type: 'AXIS_H', name: 'AXIS-H — Healthcare AI', desc: 'Healthcare-domain AI competency.', color: '#534AB7' },
];

const LEVELS: { level: CertLevel; label: string; sub: string }[] = [
  { level: 'L3', label: 'L3 · Starter', sub: '40 min · 50 MCQ' },
  { level: 'L2', label: 'L2 · Practitioner', sub: '75 min · 30Q + 3 tasks' },
  { level: 'L1', label: 'L1 · Leader', sub: '90 min · 25Q + Part A+B' },
];

export default function ExamSelectPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const start = async (certType: CertType, level: CertLevel) => {
    setBusy(`${certType}-${level}`);
    setError('');
    try {
      const created = await examApi.createSession(certType, level);
      await examApi.start(created.data.id);
      navigate(`/cbt/exam/${created.data.id}`);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to start exam');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <header className="mx-auto max-w-5xl flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">AXIS CBT Exam</h1>
        <button onClick={() => navigate('/')} className="text-sm text-gray-600 hover:text-gray-900">← Home</button>
      </header>

      {error && (
        <div className="mx-auto max-w-5xl mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="mx-auto max-w-5xl space-y-6">
        {CERTS.map((c) => (
          <section key={c.type} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{ background: c.color }} />
              <h2 className="text-lg font-bold text-gray-900">{c.name}</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">{c.desc}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {LEVELS.map((l) => {
                const key = `${c.type}-${l.level}`;
                return (
                  <button
                    key={l.level}
                    onClick={() => start(c.type, l.level)}
                    disabled={busy !== null}
                    className="text-left p-4 rounded-lg border border-gray-200 hover:border-gray-400 hover:shadow-sm transition disabled:opacity-50"
                    style={busy === key ? { borderColor: c.color, background: `${c.color}10` } : undefined}
                  >
                    <div className="text-sm font-semibold text-gray-900">{l.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{l.sub}</div>
                    {busy === key && <div className="text-xs mt-2" style={{ color: c.color }}>Starting…</div>}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
