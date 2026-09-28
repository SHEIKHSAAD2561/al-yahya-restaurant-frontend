import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { PurchaseInvoicesPage } from '@/features/purchase-invoices/components/purchase-invoices-page';

export default async function PurchaseInvoicesRoutePage() {
  await requirePermission(PERMISSIONS.PURCHASES_SUPPLIERS_ACCESS);
  return <PurchaseInvoicesPage />;
}
