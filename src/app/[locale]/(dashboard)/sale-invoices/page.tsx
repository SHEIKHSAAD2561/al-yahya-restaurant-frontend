import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { SaleInvoicesPage } from '@/features/sales/components/sale-invoices-page';

export default async function SaleInvoicesRoutePage() {
  await requirePermission(PERMISSIONS.POS_VIEW_SALE_INVOICES);
  return <SaleInvoicesPage />;
}
