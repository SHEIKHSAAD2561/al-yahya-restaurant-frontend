import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { StockCountsPage } from '@/features/stock-count/components/stock-counts-page';

export default async function StockCountRoutePage() {
  await requirePermission(PERMISSIONS.STOCK_ACCESS);
  return <StockCountsPage />;
}
