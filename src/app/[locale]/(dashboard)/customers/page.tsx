import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { CustomersPage } from '@/features/customers/components/customers-page';

export default async function CustomersRoutePage() {
  await requirePermission(PERMISSIONS.CUSTOMERS_ACCESS);
  return <CustomersPage />;
}
