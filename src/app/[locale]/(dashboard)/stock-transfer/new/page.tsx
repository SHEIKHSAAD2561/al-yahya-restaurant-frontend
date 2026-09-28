import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { StockTransferFormPage } from '@/features/stock-transfer/components/stock-transfer-form-page';

export default async function NewStockTransferRoutePage() {
  await requirePermission(PERMISSIONS.STOCK_REQUEST_TRANSFER);
  return <StockTransferFormPage />;
}
