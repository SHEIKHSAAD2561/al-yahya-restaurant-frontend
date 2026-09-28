import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { StockTransferDetailPage } from '@/features/stock-transfer/components/stock-transfer-detail-page';

export default async function StockTransferDetailRoutePage({ params }: { params: Promise<{ transferId: string }> }) {
  await requirePermission(PERMISSIONS.STOCK_ACCESS);
  const { transferId } = await params;
  return <StockTransferDetailPage transferId={transferId} />;
}
