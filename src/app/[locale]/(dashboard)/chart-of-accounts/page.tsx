import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { ChartOfAccountsPage } from '@/features/chart-of-accounts/components/chart-of-accounts-page';

export default async function ChartOfAccountsRoutePage() {
  await requirePermission(PERMISSIONS.ACCOUNTING_MANAGE_CHART_OF_ACCOUNTS);
  return <ChartOfAccountsPage />;
}
