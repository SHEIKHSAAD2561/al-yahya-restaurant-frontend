import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { ReturnInvoicesPage } from '@/features/return-invoices/components/return-invoices-page';

export default async function ReturnInvoicesRoutePage() {
  await requirePermission(PERMISSIONS.PURCHASES_SUPPLIERS_ACCESS);
  return <ReturnInvoicesPage />;
}
