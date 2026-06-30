import { StatusBadge } from '@admin/components/shared/ui-kit';
import { useI18n } from '@admin/i18n';

export function AccountStatusBadge({
  status,
}: {
  status: 'ACTIVE' | 'SUSPENDED' | 'WITHDRAWN';
}) {
  const { t } = useI18n();
  const tone: 'green' | 'red' | 'gray' =
    status === 'ACTIVE' ? 'green' : status === 'SUSPENDED' ? 'red' : 'gray';
  return <StatusBadge tone={tone}>{t(`exm.account.${status}`)}</StatusBadge>;
}
