import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { CustomerPaymentsPage } from '@/features/customer-payments/components/customer-payments-page';

export default async function CustomerPaymentsRoutePage() {
  await requirePermission(PERMISSIONS.CUSTOMERS_VIEW_BALANCES);
  return <CustomerPaymentsPage />;
}
