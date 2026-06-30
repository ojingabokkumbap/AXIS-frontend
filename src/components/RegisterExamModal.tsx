import { useState } from 'react';

interface UpcomingSchedule {
  id: string;
  certType: string;
  level: string;
  roundNumber: number;
  year: number;
  registrationStart: string;
  registrationEnd: string;
  examDate: string;
  examStartTime: string;
  capacity: number;
  currentCount: number;
  status: string;
}

interface Props {
  schedules: UpcomingSchedule[];
  registeredScheduleIds: Set<string>;
  onRegister: (scheduleId: string) => Promise<void>;
  onClose: () => void;
}

type CertFilter = 'ALL' | 'AXIS' | 'AXIS_C' | 'AXIS_H';
type LevelFilter = 'ALL' | 'L3' | 'L2' | 'L1';

function certLabel(certType: string, level: string) {
  const cert =
    certType === 'AXIS_C' ? 'AXIS-C' : certType === 'AXIS_H' ? 'AXIS-H' : 'AXIS';
  const tier = level === 'L3' ? 'Starter' : level === 'L2' ? 'Practitioner' : 'Leader';
  return `${cert} ${level} ${tier}`;
}

function formatDate(iso: string, time?: string) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return time ? `${yyyy}.${mm}.${dd} ${time}` : `${yyyy}.${mm}.${dd}`;
}

function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

function seatsLeft(capacity: number, current: number) {
  return Math.max(0, capacity - current);
}

const CERT_COLORS: Record<string, string> = {
  AXIS: 'bg-[#E6F1FB] text-[#185FA5]',
  AXIS_C: 'bg-[#EAF3DE] text-[#3B6D11]',
  AXIS_H: 'bg-[#EEEDFE] text-[#3C3489]',
};

const CERT_LETTER: Record<string, string> = {
  AXIS: 'A',
  AXIS_C: 'C',
  AXIS_H: 'H',
};

export default function RegisterExamModal({ schedules, registeredScheduleIds, onRegister, onClose }: Props) {
  const [certFilter, setCertFilter] = useState<CertFilter>('ALL');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('ALL');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const available = schedules.filter((s) => {
    if (registeredScheduleIds.has(s.id)) return false;
    if (s.status !== 'REGISTRATION_OPEN') return false;
    if (certFilter !== 'ALL' && s.certType !== certFilter) return false;
    if (levelFilter !== 'ALL' && s.level !== levelFilter) return false;
    return true;
  });

  const handleRegister = async (scheduleId: string) => {
    setBusyId(scheduleId);
    setErrorId(null);
    setErrorMsg('');
    try {
      await onRegister(scheduleId);
      onClose();
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setErrorId(scheduleId);
      setErrorMsg(msg ?? 'Registration failed. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const FilterBtn = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: string;
  }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors cursor-pointer ${
        active
          ? 'bg-[#0B1D3A] text-white border-[#0B1D3A]'
          : 'bg-white text-body border-[#E2E8F0] hover:border-[#0B1D3A] hover:text-[#0B1D3A]'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
          <div>
            <div className="text-[16px] font-bold text-[#0B1D3A]">Register for an Exam</div>
            <div className="text-[12px] text-[#6B7280] mt-0.5">
              {available.length} session{available.length !== 1 ? 's' : ''} open for registration
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-body transition-colors p-1.5 rounded-lg hover:bg-[#F5F7FA] cursor-pointer"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="flex-shrink-0 px-5 py-3 border-b border-[#E2E8F0] bg-[#F5F7FA]">
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="text-[11px] text-[#6B7280] self-center mr-1">Cert:</span>
            {(['ALL', 'AXIS', 'AXIS_C', 'AXIS_H'] as CertFilter[]).map((v) => (
              <FilterBtn key={v} active={certFilter === v} onClick={() => setCertFilter(v)}>
                {v === 'ALL' ? 'All Types' : v === 'AXIS_C' ? 'AXIS-C' : v === 'AXIS_H' ? 'AXIS-H' : 'AXIS'}
              </FilterBtn>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[11px] text-[#6B7280] self-center mr-1">Level:</span>
            {(['ALL', 'L3', 'L2', 'L1'] as LevelFilter[]).map((v) => (
              <FilterBtn key={v} active={levelFilter === v} onClick={() => setLevelFilter(v)}>
                {v === 'ALL' ? 'All Levels' : v === 'L3' ? 'L3 Starter' : v === 'L2' ? 'L2 Practitioner' : 'L1 Leader'}
              </FilterBtn>
            ))}
          </div>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {available.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-[#F5F7FA] flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="text-[14px] font-medium text-[#0B1D3A] mb-1">No sessions available</div>
              <div className="text-[12px] text-[#6B7280]">Try adjusting your filters or check back later.</div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {available.map((s) => {
                const seats = seatsLeft(s.capacity, s.currentCount);
                const daysLeft = daysUntil(s.examDate);
                const regEnd = new Date(s.registrationEnd);
                const regDaysLeft = Math.ceil((regEnd.getTime() - Date.now()) / 86_400_000);
                const almostFull = seats <= 10;
                const isBusy = busyId === s.id;
                const hasError = errorId === s.id;

                return (
                  <div
                    key={s.id}
                    className="border border-[#E2E8F0] rounded-xl p-4 hover:border-[#B5D4F4] hover:bg-[#FAFBFE] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-[15px] font-bold flex-shrink-0 ${CERT_COLORS[s.certType] ?? 'bg-[#F5F7FA] text-body'}`}>
                        {CERT_LETTER[s.certType] ?? '?'}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[14px] font-semibold text-[#0B1D3A]">
                            {certLabel(s.certType, s.level)}
                          </span>
                          <span className="text-[11px] text-[#6B7280] bg-[#F5F7FA] px-2 py-0.5 rounded-full">
                            Session {s.roundNumber} · {s.year}
                          </span>
                        </div>

                        <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 text-[12px] text-body">
                          <div className="flex items-center gap-1.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            <span>{formatDate(s.examDate, s.examStartTime)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                            <span>D-{Math.max(0, daysLeft)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                            </svg>
                            <span className={almostFull ? 'text-[#A32D2D] font-medium' : ''}>
                              {seats} seat{seats !== 1 ? 's' : ''} left
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            </svg>
                            <span className={regDaysLeft <= 3 ? 'text-[#854F0B] font-medium' : ''}>
                              Reg. closes in {regDaysLeft}d
                            </span>
                          </div>
                        </div>

                        {/* Seat bar */}
                        <div className="mt-2">
                          <div className="h-1 bg-[#E2E8F0] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${almostFull ? 'bg-[#E24B4A]' : 'bg-[#185FA5]'}`}
                              style={{ width: `${Math.min(100, (s.currentCount / s.capacity) * 100)}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-[#9CA3AF] mt-0.5">
                            {s.currentCount}/{s.capacity} registered
                          </div>
                        </div>

                        {hasError && (
                          <div className="mt-2 text-[11px] text-[#A32D2D] bg-[#FCEBEB] px-3 py-2 rounded-lg">
                            {errorMsg}
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      <div className="flex-shrink-0 flex flex-col items-end gap-1.5 ml-1">
                        {almostFull && (
                          <span className="text-[10px] text-[#A32D2D] font-medium bg-[#FCEBEB] px-1.5 py-0.5 rounded">
                            Almost full
                          </span>
                        )}
                        <button
                          onClick={() => handleRegister(s.id)}
                          disabled={isBusy || seats === 0}
                          className="px-3.5 py-2 rounded-lg text-[12px] font-semibold bg-[#185FA5] text-white hover:bg-[#14528F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {isBusy ? (
                            <span className="flex items-center gap-1.5">
                              <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                              </svg>
                              Reserving…
                            </span>
                          ) : seats === 0 ? (
                            'Full'
                          ) : (
                            'Register & Pay'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-3 border-t border-[#E2E8F0] bg-[#F5F7FA]">
          <p className="text-[11px] text-[#9CA3AF] text-center">
            Seat held for 30 minutes after registration · Payment required to confirm
          </p>
        </div>
      </div>
    </div>
  );
}
