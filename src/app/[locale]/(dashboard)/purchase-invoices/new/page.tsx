import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { PurchaseInvoiceFormPage } from '@/features/purchase-invoices/components/purchase-invoice-form-page';

export default async function NewPurchaseInvoiceRoutePage() {
  await requirePermission(PERMISSIONS.PURCHASES_SUPPLIERS_MANAGE_INVOICES);
  return <PurchaseInvoiceFormPage />;
}
