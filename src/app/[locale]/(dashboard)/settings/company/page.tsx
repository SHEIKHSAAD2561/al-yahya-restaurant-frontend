import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { CompanyOverviewPage } from '@/features/company/components/company-overview-page';

export default async function SettingsCompanyPage() {
  await requirePermission(PERMISSIONS.SETTINGS_GENERAL_ACCOUNT_SETUP);
  return <CompanyOverviewPage />;
}
