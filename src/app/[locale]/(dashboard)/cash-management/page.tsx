import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { CashManagementPage } from '@/features/cash-management/components/cash-management-page';

export default async function CashManagementRoutePage() {
  await requirePermission(PERMISSIONS.POS_MANAGE_CASH);
  return <CashManagementPage />;
}
