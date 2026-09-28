import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { SupplierPaymentsPage } from '@/features/supplier-payments/components/supplier-payments-page';

export default async function SupplierPaymentsRoutePage() {
  await requirePermission(PERMISSIONS.PURCHASES_SUPPLIERS_VIEW_CREDIT_BALANCE);
  return <SupplierPaymentsPage />;
}
