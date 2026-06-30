import type {
  BadgeTone,
  CertLevel,
  CertType,
  EligibilityStatus,
  ExamEntryGateKind,
  RegistrationDto,
  RegistrationStatus,
  SectionKey,
  TabKey,
} from './types';
import { VALID_SECTIONS } from './types';
export { openPrintPopup } from '@/utils/openPrintPopup';

/**
 * Venues the backend treats as flexible-entry (no ±30/10min window) — must
 * mirror `ONLINE_VENUES` in cbt-sessions.service.ts. For these, entry is
 * allowed anytime before the deadline regardless of level; the time window
 * only applies to physical venues. Keying this on venue (not level) keeps the
 * MyPage gate consistent with what the backend actually enforces on start.
 */
const ONLINE_VENUES = ['ONLINE_CBT', 'ONLINE', 'REMOTE'];

/** AXIS-C L1 gates where the candidate may request a 100% eligibility refund. */
export function isEligibilityRefundEligible(r: RegistrationDto): boolean {
  if (r.certType !== 'AXIS_C' || r.level !== 'L1' || r.status !== 'PAID') return false;
  if (r.eligibilityRefundRequested) return false;
  const status = effectiveEligibilityStatus(r);
  return status !== 'APPROVED';
}

/** AXIS-C L1 real exam requires admin/expert approval of eligibility docs. */
function axisCL1RequiresEligibilityApproval(r: RegistrationDto): boolean {
  return r.certType === 'AXIS_C' && r.level === 'L1';
}

/** Infer review state when DB still has NOT_REQUIRED but a doc exists. */
function effectiveEligibilityStatus(r: RegistrationDto): EligibilityStatus {
  const raw: EligibilityStatus = r.eligibilityStatus ?? 'NOT_REQUIRED';
  if (raw === 'NOT_REQUIRED' && r.hasSupportDoc) return 'PENDING';
  return raw;
}

function eligibilityEntryBlock(r: RegistrationDto): {
  tone: BadgeTone;
  label: string;
  hint: string;
  gate: ExamEntryGateKind;
} | null {
  if (!axisCL1RequiresEligibilityApproval(r)) return null;
  const status = effectiveEligibilityStatus(r);
  if (status === 'APPROVED') return null;
  if (status === 'REJECTED') {
    const noteHint = r.eligibilityNote?.trim();
    return {
      tone: 'red',
      label: '반려됨',
      hint: noteHint ? `반려 사유: ${noteHint}` : '자격 서류가 반려되었습니다',
      gate: 'eligibility_rejected',
    };
  }
  if (status === 'PENDING') {
    return {
      tone: 'orange',
      label: '승인 대기',
      hint: '자격 서류 검토 대기 중',
      gate: 'eligibility_pending',
    };
  }
  return {
    tone: 'orange',
    label: '서류 미제출',
    hint: '자격 서류 제출 및 승인 필요',
    gate: 'eligibility_missing_doc',
  };
}

export function formatExamDate(iso: string, time?: string) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return time ? `${yyyy}.${mm}.${dd} ${time}` : `${yyyy}.${mm}.${dd}`;
}

export function formatLocalDateTime(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
}

export function daysUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / (24 * 3600 * 1000));
}

export function certLabel(certType: CertType, level: CertLevel): string {
  const cert =
    certType === 'AXIS_C' ? 'AXIS-C' : certType === 'AXIS_H' ? 'AXIS-H' : 'AXIS';
  const tier = level === 'L3' ? 'Starter' : level === 'L2' ? 'Practitioner' : 'Leader';
  return `${cert} ${level} ${tier}`;
}

export function formatKrw(amount: number): string {
  return `KRW ${amount.toLocaleString()}`;
}

/** Official exam round label for scores/history (schedule round, not re-attempt count). */
export function formatExamRoundLabel(
  roundNumber: number | null | undefined,
  year: number | null | undefined,
  lang: 'ko' | 'en',
): string {
  if (roundNumber == null) return '—';
  if (lang === 'ko') {
    return year != null ? `${year}년 ${roundNumber}회` : `${roundNumber}회`;
  }
  return year != null ? `${year} Round ${roundNumber}` : `Round ${roundNumber}`;
}

/** Re-attempt suffix when attemptNo > 1. */
export function formatAttemptSuffix(attemptNo: number, lang: 'ko' | 'en'): string | null {
  if (attemptNo <= 1) return null;
  return lang === 'ko' ? `${attemptNo}차 응시` : `Attempt ${attemptNo}`;
}

export function resultStatusBadge(result: {
  status: string;
  passed: boolean | null;
  partialPass: 'WRITTEN_ONLY' | 'PRACTICAL_ONLY' | null;
}): { tone: BadgeTone; labelKey: 'mypage.scores.grading' | 'mypage.scores.pass' | 'mypage.scores.partialPass' | 'mypage.scores.fail' } {
  if (result.status === 'SUBMITTED') {
    return { tone: 'orange', labelKey: 'mypage.scores.grading' };
  }
  if (result.passed === null) {
    return { tone: 'orange', labelKey: 'mypage.scores.grading' };
  }
  if (result.passed) return { tone: 'blue', labelKey: 'mypage.scores.pass' };
  if (result.partialPass) return { tone: 'orange', labelKey: 'mypage.scores.partialPass' };
  return { tone: 'red', labelKey: 'mypage.scores.fail' };
}

export const isValidSection = (s: string | null): s is SectionKey =>
  !!s && (VALID_SECTIONS as string[]).includes(s);

export function sectionToTab(s: SectionKey): TabKey {
  switch (s) {
    case 'registrations': return 'registrations';
    case 'schedule': return 'myExams';
    case 'taken': case 'scores': case 'partial': return 'scores';
    case 'certs': return 'certs';
    case 'alerts': return 'inquiry';
    case 'profile': return 'profile';
  }
}

export function regBadge(status: RegistrationStatus): { tone: BadgeTone; text: string } {
  switch (status) {
    case 'PAID':
      return { tone: 'green', text: 'Confirmed' };
    case 'PENDING_PAYMENT':
      return { tone: 'orange', text: 'Payment Pending' };
    case 'CANCELLED':
      return { tone: 'gray', text: 'Cancelled' };
    case 'REFUNDED':
      return { tone: 'red', text: 'Refunded' };
    case 'EXAM_COMPLETED':
      return { tone: 'blue', text: 'Completed' };
  }
}

/** Same rules as the Confirmed Exams schedule tab — L3 anytime before deadline; L2/L1 ±30/10 min window. */
export function registrationExamEntryState(r: RegistrationDto): {
  tone: BadgeTone;
  label: string;
  canEnter: boolean;
  hint: string;
  gate: ExamEntryGateKind;
  entryOpensAt: Date | null;
  entryClosesAt: Date | null;
} {
  if (r.status !== 'PAID') {
    return {
      tone: 'orange',
      label: 'Waiting',
      canEnter: false,
      hint: 'Payment required',
      gate: 'payment',
      entryOpensAt: null,
      entryClosesAt: null,
    };
  }
  const eligibilityBlock = eligibilityEntryBlock(r);
  if (eligibilityBlock) {
    return {
      ...eligibilityBlock,
      canEnter: false,
      entryOpensAt: null,
      entryClosesAt: null,
    };
  }
  if (r.attemptsExhausted) {
    return {
      tone: 'red',
      label: 'Exhausted',
      canEnter: false,
      hint: `All ${r.maxAttempts} attempts used`,
      gate: 'exhausted',
      entryOpensAt: null,
      entryClosesAt: null,
    };
  }
  if (r.examDeadlineExpired) {
    return {
      tone: 'red',
      label: 'Completed',
      canEnter: false,
      hint: 'Exam deadline expired',
      gate: 'deadline',
      entryOpensAt: null,
      entryClosesAt: null,
    };
  }
  const now = Date.now();
  const examTime = new Date(r.schedule.examDate).getTime();
  // L3, or any online-venue exam → flexible entry (anytime before deadline),
  // mirroring the backend which only enforces the ±30/10min window for
  // physical venues (see cbt-sessions.service.ts isOnlineExam check).
  const isAnytime = r.level === 'L3' || ONLINE_VENUES.includes(r.schedule.venue);
  if (isAnytime) {
    return {
      tone: 'green',
      label: 'Available',
      canEnter: true,
      hint: 'Enter now',
      gate: 'enter',
      entryOpensAt: null,
      entryClosesAt: null,
    };
  }
  const openAt = examTime - 30 * 60_000;
  const closeAt = examTime + 10 * 60_000;
  if (now >= openAt && now <= closeAt) {
    return {
      tone: 'green',
      label: 'Available',
      canEnter: true,
      hint: 'Enter now',
      gate: 'enter',
      entryOpensAt: new Date(openAt),
      entryClosesAt: new Date(closeAt),
    };
  }
  if (now < openAt) {
    const entryTime = new Date(openAt);
    const hh = String(entryTime.getHours()).padStart(2, '0');
    const mm = String(entryTime.getMinutes()).padStart(2, '0');
    const dMinus = Math.max(0, daysUntil(r.schedule.examDate));
    return {
      tone: dMinus > 0 ? 'blue' : 'orange',
      label: dMinus > 0 ? `D-${dMinus}` : 'Waiting',
      canEnter: false,
      hint: `Entry from ${hh}:${mm}`,
      gate: 'too_early',
      entryOpensAt: new Date(openAt),
      entryClosesAt: new Date(closeAt),
    };
  }
  return {
    tone: 'gray',
    label: 'Completed',
    canEnter: false,
    hint: 'Entry window closed',
    gate: 'too_late',
    entryOpensAt: new Date(openAt),
    entryClosesAt: new Date(closeAt),
  };
}
