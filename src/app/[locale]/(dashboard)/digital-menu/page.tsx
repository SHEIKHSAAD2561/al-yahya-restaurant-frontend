import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { DigitalMenuAdminPage } from '@/features/digital-menu/components/digital-menu-admin-page';

export default async function DigitalMenuRoutePage() {
  await requirePermission(PERMISSIONS.POS_MANAGE_DIGITAL_MENU);
  return <DigitalMenuAdminPage />;
}
