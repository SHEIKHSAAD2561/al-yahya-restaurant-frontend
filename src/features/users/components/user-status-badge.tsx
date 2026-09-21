import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { USER_STATUSES, type UserStatus } from '../types/user';

const VARIANT_BY_STATUS: Record<UserStatus, 'success' | 'warning' | 'neutral'> = {
  [USER_STATUSES.ACTIVE]: 'success',
  [USER_STATUSES.PENDING]: 'warning',
  [USER_STATUSES.INACTIVE]: 'neutral',
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const t = useTranslations('common');
  const labelKey =
    status === USER_STATUSES.ACTIVE
      ? 'active'
      : status === USER_STATUSES.PENDING
        ? 'pending'
        : 'inactive';

  return <Badge variant={VARIANT_BY_STATUS[status]}>{t(labelKey)}</Badge>;
}
