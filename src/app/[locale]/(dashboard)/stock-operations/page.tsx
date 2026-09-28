import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { StockMovementsPage } from '@/features/stock-operations/components/stock-movements-page';

export default async function StockOperationsRoutePage() {
  await requirePermission(PERMISSIONS.STOCK_ACCESS);
  return <StockMovementsPage />;
}
