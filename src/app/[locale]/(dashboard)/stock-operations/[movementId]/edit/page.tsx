import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { StockMovementEditPage } from '@/features/stock-operations/components/stock-movement-edit-page';

export default async function StockMovementEditRoutePage({ params }: { params: Promise<{ movementId: string }> }) {
  await requirePermission(PERMISSIONS.STOCK_ACCESS);
  const { movementId } = await params;
  return <StockMovementEditPage movementId={movementId} />;
}
