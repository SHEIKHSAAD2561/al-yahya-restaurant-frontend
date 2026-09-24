import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { TaxesPage } from '@/features/taxes/components/taxes-page';

export default async function SettingsTaxesPage() {
  await requirePermission(PERMISSIONS.SETTINGS_FINANCIAL_SETTINGS);
  return <TaxesPage />;
}
