import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { PurchaseInvoiceEditPage } from '@/features/purchase-invoices/components/purchase-invoice-edit-page';

export default async function PurchaseInvoiceEditRoutePage({ params }: { params: Promise<{ invoiceId: string }> }) {
  await requirePermission(PERMISSIONS.PURCHASES_SUPPLIERS_ACCESS);
  const { invoiceId } = await params;
  return <PurchaseInvoiceEditPage invoiceId={invoiceId} />;
}
