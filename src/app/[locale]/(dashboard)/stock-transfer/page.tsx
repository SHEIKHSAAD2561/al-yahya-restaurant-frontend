import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { StockTransfersPage } from '@/features/stock-transfer/components/stock-transfers-page';

export default async function StockTransferRoutePage() {
  await requirePermission(PERMISSIONS.STOCK_ACCESS);
  return <StockTransfersPage />;
}
