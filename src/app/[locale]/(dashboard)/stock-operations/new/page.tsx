import { requireAnyPermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { StockMovementFormPage } from '@/features/stock-operations/components/stock-movement-form-page';

export default async function NewStockMovementRoutePage() {
  await requireAnyPermission(PERMISSIONS.STOCK_RECORD_DRAFT, PERMISSIONS.STOCK_MANAGE_MOVEMENTS);
  return <StockMovementFormPage />;
}
