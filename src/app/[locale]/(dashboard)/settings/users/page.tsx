import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { UsersPage } from '@/features/users/components/users-page';

export default async function SettingsUsersPage() {
  await requirePermission(PERMISSIONS.SETTINGS_USERS_VIEW);
  return <UsersPage />;
}
