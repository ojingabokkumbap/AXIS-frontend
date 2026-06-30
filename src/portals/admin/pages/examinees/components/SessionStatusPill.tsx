import { StatusBadge } from '@admin/components/shared/ui-kit';
import { useI18n } from '@admin/i18n';
import type { ExamineeDetail, ExamineeStatus } from '@admin/services/api';
import { statusBadgeTone } from '../lib/status';

export function SessionStatusPill({
  status,
  passed,
}: {
  status: ExamineeDetail['registrations'][number]['sessions'][number]['status'];
  passed: boolean | null;
}) {
  const { t } = useI18n();
  let key: ExamineeStatus;
  switch (status) {
    case 'CREATED':
      key = 'NOT_STARTED';
      break;
    case 'IN_PROGRESS':
      key = 'IN_PROGRESS';
      break;
    case 'SUBMITTED':
      key = 'SUBMITTED';
      break;
    case 'TERMINATED':
      key = 'TERMINATED';
      break;
    case 'GRADED':
      key = passed ? 'GRADED_PASSED' : 'GRADED_FAILED';
      break;
  }
  return <StatusBadge tone={statusBadgeTone(key)}>{t(`exm.status.${key}`)}</StatusBadge>;
}
