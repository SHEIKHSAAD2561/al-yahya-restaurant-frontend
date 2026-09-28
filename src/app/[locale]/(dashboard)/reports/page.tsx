import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { ReportsPage } from '@/features/reports/components/reports-page';

export default async function ReportsRoutePage() {
  await requirePermission(PERMISSIONS.REPORTS_ACCESS);
  return <ReportsPage />;
}
