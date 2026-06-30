import { isAxiosError } from 'axios';
import { registrationsApi } from '@/services/api';
import type { ScheduleSummary } from './WizardContext';

export class RegisterSessionError extends Error {
  readonly code?: 'ALREADY_PAID' | 'SCHEDULE_FULL';

  constructor(
    message: string,
    code?: 'ALREADY_PAID' | 'SCHEDULE_FULL',
  ) {
    super(message);
    this.code = code;
    this.name = 'RegisterSessionError';
  }
}

export function formatRegisterError(err: unknown, fallback: string): string {
  if (err instanceof RegisterSessionError) return err.message;
  if (!isAxiosError(err)) return fallback;
  const data = err.response?.data as { message?: string | string[] } | undefined;
  const msg = data?.message;
  if (typeof msg === 'string' && msg.trim()) return msg;
  if (Array.isArray(msg) && msg.length > 0) return msg.join(', ');
  return fallback;
}

type MineRegistration = {
  id: string;
  status: string;
  seatHeldUntil?: string | null;
  certType?: string;
  level?: string;
  schedule: {
    id: string;
    examDate?: string;
    examStartTime?: string;
  };
};

/** Create seat hold, or resume an existing PENDING_PAYMENT hold for the same schedule. */
export async function createOrResumeRegistration(
  schedule: ScheduleSummary,
): Promise<{ id: string; seatHeldUntil: string }> {
  const defaultHold = () => new Date(Date.now() + 30 * 60_000).toISOString();

  try {
    const res = await registrationsApi.create(schedule.id);
    const reg = res.data as { id: string; seatHeldUntil?: string };
    return {
      id: reg.id,
      seatHeldUntil: reg.seatHeldUntil ?? defaultHold(),
    };
  } catch (err) {
    if (!isAxiosError(err) || err.response?.status !== 409) throw err;

    const rawMsg = (err.response.data as { message?: string })?.message ?? '';
    if (rawMsg.includes('Schedule is full')) {
      throw new RegisterSessionError(rawMsg, 'SCHEDULE_FULL');
    }

    // "Already registered" (friendly) or a raw unique-key conflict from a
    // concurrent double-submit both mean a registration already exists for this
    // (user, schedule) — resume it rather than failing.
    const isDuplicateConflict =
      rawMsg.includes('Already registered') ||
      rawMsg.includes('registrations_user_id_schedule_id');
    if (!isDuplicateConflict) throw err;

    const mine = await registrationsApi.mine();
    const list = (Array.isArray(mine.data) ? mine.data : []) as MineRegistration[];
    const existing = list.find((r) => {
      if (r.schedule.id === schedule.id) return true;
      // L3 virtual slot IDs can be materialized to a real schedule ID on create.
      // Fallback to slot signature matching so "Already registered" can resume.
      return (
        r.certType === schedule.certType &&
        r.level === schedule.level &&
        r.schedule.examDate === schedule.examDate &&
        r.schedule.examStartTime === schedule.examStartTime
      );
    });

    if (existing?.status === 'PENDING_PAYMENT') {
      return {
        id: existing.id,
        seatHeldUntil: existing.seatHeldUntil ?? defaultHold(),
      };
    }
    if (existing?.status === 'PAID' || existing?.status === 'EXAM_COMPLETED') {
      throw new RegisterSessionError(rawMsg, 'ALREADY_PAID');
    }

    throw err;
  }
}
