import { useEffect, useState, type ReactNode } from 'react';
import { AlertTriangle, Camera, Loader2, Monitor, Radio, ShieldAlert } from 'lucide-react';
import { Card } from '@expert/components/shared/ui-kit';
import { expertApi, type AiEvidenceItem, type GradingProctorEvent } from '@expert/services/api';

interface Props {
  sessionId: string;
  proctorWarnings: number;
  cheatingSuspect: boolean;
  events: GradingProctorEvent[];
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

function severityTone(sev: string): 'red' | 'orange' | 'blue' {
  const s = sev.toUpperCase();
  if (s === 'HIGH') return 'red';
  if (s === 'MED' || s === 'MEDIUM') return 'orange';
  return 'blue';
}

export function ProctorEvidencePanel({
  sessionId,
  proctorWarnings,
  cheatingSuspect,
  events,
}: Props) {
  const [evidenceById, setEvidenceById] = useState<Record<string, AiEvidenceItem>>({});
  const [loadingEvidence, setLoadingEvidence] = useState(false);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);

  useEffect(() => {
    if (events.length === 0) return;
    let cancelled = false;
    setLoadingEvidence(true);
    setEvidenceError(null);
    expertApi
      .getProctorEvidence(sessionId)
      .then((res) => {
        if (cancelled) return;
        const map: Record<string, AiEvidenceItem> = {};
        for (const item of res.data.items) map[item.id] = item;
        setEvidenceById(map);
      })
      .catch(() => {
        if (!cancelled) setEvidenceError('감독 증빙을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoadingEvidence(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId, events.length]);

  if (!cheatingSuspect && proctorWarnings === 0 && events.length === 0) return null;

  return (
    <Card className="p-5 mb-6 border-amber-200 bg-amber-50/30">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-5 h-5 text-amber-700" />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-slate-900">감독 · 부정행위 의심 기록</h3>
          <p className="text-[13px] text-slate-600 mt-0.5">
            경고 {proctorWarnings}회
            {cheatingSuspect ? ' · 고위험 이벤트가 감지되었습니다. 채점 전 반드시 확인하세요.' : ''}
          </p>
        </div>
      </div>

      {evidenceError && (
        <div className="flex items-center gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 mb-3">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {evidenceError}
        </div>
      )}

      {loadingEvidence && (
        <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          증빙 스냅샷 불러오는 중…
        </div>
      )}

      <ul className="space-y-2 max-h-80 overflow-y-auto">
        {events.length === 0 ? (
          <li className="text-sm text-slate-500">기록된 이벤트가 없습니다.</li>
        ) : (
          events.map((p) => {
            const tone = severityTone(p.severity);
            const ev = evidenceById[p.id];
            const webcamSrc = ev?.evidenceUrl ?? null;
            const screenSrc = ev?.screenEvidenceUrl ?? null;
            const audioSrc = ev?.videoClipUrl ?? null;
            const label =
              p.captionKo ?? p.captionEn ?? p.type.replace(/_/g, ' ').toLowerCase();
            return (
              <li
                key={p.id}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-xs text-slate-400 tabular-nums w-16">{fmtTime(p.createdAt)}</span>
                  <span
                    className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
                      tone === 'red'
                        ? 'bg-rose-100 text-rose-800'
                        : tone === 'orange'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {p.severity}
                  </span>
                  <span className="text-slate-700 flex-1">{label}</span>
                </div>
                {(webcamSrc || screenSrc || audioSrc) && (
                  <div className="flex flex-wrap gap-3 mt-3 pl-1">
                    {webcamSrc && (
                      <EvidenceThumb src={webcamSrc} label="웹캠" icon={<Camera className="w-3 h-3" />} />
                    )}
                    {screenSrc && (
                      <EvidenceThumb src={screenSrc} label="화면" icon={<Monitor className="w-3 h-3" />} />
                    )}
                    {audioSrc && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 inline-flex items-center gap-1">
                          <Radio className="w-3 h-3" />
                          음성
                        </span>
                        <audio controls src={audioSrc} className="h-8 max-w-xs" />
                      </div>
                    )}
                  </div>
                )}
                {!webcamSrc && !screenSrc && !audioSrc && p.hasEvidence && !loadingEvidence && (
                  <p className="text-[11px] text-slate-400 mt-2 italic">증빙 만료 또는 처리 중</p>
                )}
              </li>
            );
          })
        )}
      </ul>
    </Card>
  );
}

function EvidenceThumb({
  src,
  label,
  icon,
}: {
  src: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <a href={src} target="_blank" rel="noreferrer noopener" className="group flex flex-col gap-1">
      <span className="text-[10px] text-slate-500 inline-flex items-center gap-1">
        {icon}
        {label}
      </span>
      <img
        src={src}
        alt={label}
        className="w-36 h-24 object-cover rounded-lg border border-slate-200 group-hover:ring-2 group-hover:ring-indigo-300"
      />
    </a>
  );
}
