import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { StockCountDetailPage } from '@/features/stock-count/components/stock-count-detail-page';

export default async function StockCountDetailRoutePage({ params }: { params: Promise<{ countId: string }> }) {
  await requirePermission(PERMISSIONS.STOCK_ACCESS);
  const { countId } = await params;
  return <StockCountDetailPage countId={countId} />;
}
