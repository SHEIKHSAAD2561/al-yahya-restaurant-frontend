import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { SaleSettingsPage } from '@/features/sale-settings/components/sale-settings-page';

export default async function SaleSettingsRoutePage() {
  await requirePermission(PERMISSIONS.POS_MANAGE_SALE_SETTINGS);
  return <SaleSettingsPage />;
}
