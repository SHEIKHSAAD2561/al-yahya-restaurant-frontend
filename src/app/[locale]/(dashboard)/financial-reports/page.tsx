import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { FinancialReportsPage } from '@/features/financial-reports/components/financial-reports-page';

export default async function FinancialReportsRoutePage() {
  await requirePermission(PERMISSIONS.ACCOUNTING_VIEW_FINANCIAL_REPORTS);
  return <FinancialReportsPage />;
}
