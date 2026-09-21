import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { EditRolePermissionsPage } from '@/features/roles/components/edit-role-permissions-page';

export default async function SettingsRolePermissionsPage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) {
  await requirePermission(PERMISSIONS.SETTINGS_ROLES_MANAGE);
  const { roleId } = await params;
  return <EditRolePermissionsPage roleId={roleId} />;
}
