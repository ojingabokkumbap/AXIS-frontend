import type {
  CertType,
  ExamineeRegistrationDetail,
  ExamineeStatus,
} from '@admin/services/api';

export type BadgeTone =
  | 'green'
  | 'blue'
  | 'orange'
  | 'red'
  | 'gray'
  | 'purple'
  | 'amber'
  | 'indigo';

export function certLabel(c: CertType): string {
  return c === 'AXIS_C' ? 'AXIS-C' : c === 'AXIS_H' ? 'AXIS-H' : 'AXIS';
}

export function statusBadgeTone(s: ExamineeStatus): BadgeTone {
  switch (s) {
    case 'NOT_STARTED':
      return 'gray';
    case 'IN_PROGRESS':
      return 'indigo';
    case 'SUBMITTED':
      return 'blue';
    case 'TERMINATED':
      return 'red';
    case 'GRADED_PASSED':
      return 'green';
    case 'GRADED_FAILED':
      return 'orange';
    case 'CERTIFIED':
      return 'purple';
    case 'PENDING_PAYMENT':
      return 'amber';
    case 'CANCELLED':
      return 'gray';
    case 'REFUNDED':
      return 'gray';
  }
}

export function mapRegToStatus(r: ExamineeRegistrationDetail): ExamineeStatus {
  if (r.status === 'REFUNDED') return 'REFUNDED';
  if (r.status === 'CANCELLED') return 'CANCELLED';
  if (r.status === 'PENDING_PAYMENT') return 'PENDING_PAYMENT';
  const latest = r.sessions[0];
  if (!latest || latest.status === 'CREATED') return 'NOT_STARTED';
  if (latest.status === 'IN_PROGRESS') return 'IN_PROGRESS';
  if (latest.status === 'SUBMITTED') return 'SUBMITTED';
  if (latest.status === 'TERMINATED') return 'TERMINATED';
  if (latest.status === 'GRADED') return latest.passed ? 'GRADED_PASSED' : 'GRADED_FAILED';
  return 'NOT_STARTED';
}

export const STATUS_OPTIONS: ExamineeStatus[] = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'SUBMITTED',
  'TERMINATED',
  'GRADED_PASSED',
  'GRADED_FAILED',
  'CERTIFIED',
  'PENDING_PAYMENT',
  'CANCELLED',
  'REFUNDED',
];

export const CERT_OPTIONS: CertType[] = ['AXIS', 'AXIS_C', 'AXIS_H'];
export const LEVEL_OPTIONS = ['L3', 'L2', 'L1'] as const;
