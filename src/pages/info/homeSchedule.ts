import type { RegistrationDto, CertType, UpcomingScheduleDto } from '@/pages/user/mypage/types';
import { formatExamDate, formatLocalDateTime } from '@/pages/user/mypage/helpers';

export interface PublicScheduleDto {
  id: string;
  certType: CertType;
  level: string;
  roundNumber: number;
  year: number;
  registrationStart: string;
  registrationEnd: string;
  examDate: string;
  examStartTime: string;
  status: string;
}

export type HomeScheduleCta =
  | { kind: 'apply' }
  | { kind: 'pay'; reg: RegistrationDto }
  | { kind: 'mypage' }
  | { kind: 'results' }
  | { kind: 'alert' }
  | { kind: 'closed' };

export interface HomeScheduleRowModel {
  key: string;
  statusKey:
    | 'home.sched.regOpen'
    | 'home.sched.regSoon'
    | 'home.sched.regClosed'
    | 'home.sched.statusPayPending'
    | 'home.sched.statusRegistered'
    | 'home.sched.statusCompleted';
  statusColor: string;
  title: string;
  meta: string;
  sub: string;
  cta: HomeScheduleCta;
}

const CERT_TYPES: CertType[] = ['AXIS', 'AXIS_C', 'AXIS_H'];

const ACCENT = '#3b82f6';
const GRAY_300 = '#737373';
const GREEN = '#059669';
const AMBER = '#D97706';

export function certShortLabel(certType: CertType, level: string): string {
  const cert =
    certType === 'AXIS_C' ? 'AXIS-C' : certType === 'AXIS_H' ? 'AXIS-H' : 'AXIS';
  return `${cert} ${level}`;
}

function examMeta(roundNumber: number, examDate: string, lang: 'ko' | 'en'): string {
  const date = formatExamDate(examDate);
  return lang === 'ko' ? `제${roundNumber}회 · ${date}` : `Round ${roundNumber} · ${date}`;
}

function formatRegPeriod(start: string, end: string, lang: 'ko' | 'en'): string {
  const short = (iso: string) => {
    const d = new Date(iso);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${mm}.${dd}`;
  };
  return lang === 'ko'
    ? `접수: ${short(start)} ~ ${short(end)}`
    : `Reg: ${short(start)} – ${short(end)}`;
}

const REG_STATUS_RANK: Record<RegistrationDto['status'], number> = {
  PENDING_PAYMENT: 0,
  PAID: 1,
  EXAM_COMPLETED: 2,
  CANCELLED: 99,
  REFUNDED: 99,
};

function registrationSub(reg: RegistrationDto, lang: 'ko' | 'en'): string {
  if (reg.status === 'PENDING_PAYMENT' && reg.seatHeldUntil) {
    const deadline = formatLocalDateTime(reg.seatHeldUntil);
    return lang === 'ko'
      ? `결제 마감: ${deadline}`
      : `Pay by ${deadline}`;
  }
  if (reg.status === 'EXAM_COMPLETED') {
    return lang === 'ko' ? '응시가 완료되었습니다' : 'Exam completed';
  }
  if (reg.examDeadline && !reg.examDeadlineExpired) {
    const until = formatExamDate(reg.examDeadline);
    return lang === 'ko' ? `응시 기한: ${until}` : `Take exam by ${until}`;
  }
  const examWhen = formatExamDate(reg.schedule.examDate, reg.schedule.examStartTime);
  return lang === 'ko' ? `시험: ${examWhen}` : `Exam: ${examWhen}`;
}

function registrationRow(reg: RegistrationDto, lang: 'ko' | 'en'): HomeScheduleRowModel {
  const title = certShortLabel(reg.certType, reg.level);
  const meta = examMeta(reg.schedule.roundNumber, reg.schedule.examDate, lang);

  if (reg.status === 'PENDING_PAYMENT') {
    return {
      key: `reg-${reg.id}`,
      statusKey: 'home.sched.statusPayPending',
      statusColor: AMBER,
      title,
      meta,
      sub: registrationSub(reg, lang),
      cta: { kind: 'pay', reg },
    };
  }

  if (reg.status === 'EXAM_COMPLETED') {
    return {
      key: `reg-${reg.id}`,
      statusKey: 'home.sched.statusCompleted',
      statusColor: GREEN,
      title,
      meta,
      sub: registrationSub(reg, lang),
      cta: { kind: 'results' },
    };
  }

  return {
    key: `reg-${reg.id}`,
    statusKey: 'home.sched.statusRegistered',
    statusColor: ACCENT,
    title,
    meta,
    sub: registrationSub(reg, lang),
    cta: { kind: 'mypage' },
  };
}

export function pickUserScheduleRows(
  registrations: RegistrationDto[],
  lang: 'ko' | 'en',
): HomeScheduleRowModel[] {
  const relevant = registrations.filter((r) =>
    r.status === 'PENDING_PAYMENT'
    || r.status === 'PAID'
    || r.status === 'EXAM_COMPLETED',
  );

  const sorted = [...relevant].sort((a, b) => {
    const rankDiff = REG_STATUS_RANK[a.status] - REG_STATUS_RANK[b.status];
    if (rankDiff !== 0) return rankDiff;
    const aTime = new Date(a.schedule.examDate).getTime();
    const bTime = new Date(b.schedule.examDate).getTime();
    if (a.status === 'EXAM_COMPLETED') return bTime - aTime;
    return aTime - bTime;
  });

  return sorted.map((r) => registrationRow(r, lang));
}

export function pickNearestL3PerType(
  schedules: PublicScheduleDto[] | UpcomingScheduleDto[],
): Array<PublicScheduleDto | UpcomingScheduleDto> {
  const nearest = new Map<CertType, PublicScheduleDto | UpcomingScheduleDto>();

  for (const s of schedules) {
    if (s.level !== 'L3') continue;
    const existing = nearest.get(s.certType);
    if (!existing || new Date(s.examDate) < new Date(existing.examDate)) {
      nearest.set(s.certType, s);
    }
  }

  return CERT_TYPES.flatMap((cert) => {
    const row = nearest.get(cert);
    return row ? [row] : [];
  });
}

function publicScheduleStatus(
  schedule: PublicScheduleDto | UpcomingScheduleDto,
): HomeScheduleRowModel['statusKey'] {
  const now = Date.now();
  const regStart = new Date(schedule.registrationStart).getTime();
  const regEnd = new Date(schedule.registrationEnd).getTime();

  if (schedule.status === 'REGISTRATION_OPEN' && regEnd >= now && regStart <= now) {
    return 'home.sched.regOpen';
  }
  if (schedule.status === 'UPCOMING' || regStart > now) {
    return 'home.sched.regSoon';
  }
  if (schedule.status === 'REGISTRATION_OPEN' && regEnd >= now) {
    return 'home.sched.regOpen';
  }
  return 'home.sched.regClosed';
}

function publicScheduleCta(
  schedule: PublicScheduleDto | UpcomingScheduleDto,
): HomeScheduleCta {
  const status = publicScheduleStatus(schedule);
  if (status === 'home.sched.regOpen') return { kind: 'apply' };
  if (status === 'home.sched.regSoon') return { kind: 'alert' };
  return { kind: 'closed' };
}

function publicScheduleStatusColor(statusKey: HomeScheduleRowModel['statusKey']): string {
  if (statusKey === 'home.sched.regOpen') return ACCENT;
  if (statusKey === 'home.sched.regSoon') return GRAY_300;
  return GRAY_300;
}

export function pickPublicL3ScheduleRows(
  schedules: PublicScheduleDto[] | UpcomingScheduleDto[],
  lang: 'ko' | 'en',
): HomeScheduleRowModel[] {
  return pickNearestL3PerType(schedules).map((s) => {
    const statusKey = publicScheduleStatus(s);
    return {
      key: `sched-${s.id}`,
      statusKey,
      statusColor: publicScheduleStatusColor(statusKey),
      title: certShortLabel(s.certType, s.level),
      meta: examMeta(s.roundNumber, s.examDate, lang),
      sub: formatRegPeriod(s.registrationStart, s.registrationEnd, lang),
      cta: publicScheduleCta(s),
    };
  });
}
