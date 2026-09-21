import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { RolesPage } from '@/features/roles/components/roles-page';

export default async function SettingsRolesPage() {
  await requirePermission(PERMISSIONS.SETTINGS_ROLES_VIEW);
  return <RolesPage />;
}
