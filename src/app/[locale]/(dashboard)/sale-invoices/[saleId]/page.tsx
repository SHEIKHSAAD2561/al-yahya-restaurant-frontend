import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { InvoiceDetailsPage } from '@/features/sales/components/invoice-details-page';

export default async function InvoiceDetailsRoutePage({ params }: { params: Promise<{ saleId: string }> }) {
  await requirePermission(PERMISSIONS.POS_VIEW_SALE_INVOICES);
  const { saleId } = await params;
  return <InvoiceDetailsPage saleId={saleId} />;
}
