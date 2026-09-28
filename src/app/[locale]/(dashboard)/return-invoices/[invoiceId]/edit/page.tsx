import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { ReturnInvoiceEditPage } from '@/features/return-invoices/components/return-invoice-edit-page';

export default async function ReturnInvoiceEditRoutePage({ params }: { params: Promise<{ invoiceId: string }> }) {
  await requirePermission(PERMISSIONS.PURCHASES_SUPPLIERS_ACCESS);
  const { invoiceId } = await params;
  return <ReturnInvoiceEditPage invoiceId={invoiceId} />;
}
