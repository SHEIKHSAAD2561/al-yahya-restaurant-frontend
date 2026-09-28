import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { CustomerFormPage } from '@/features/customers/components/customer-form-page';

export default async function NewCustomerPage() {
  await requirePermission(PERMISSIONS.CUSTOMERS_ACCESS, PERMISSIONS.CUSTOMERS_CREATE);
  return <CustomerFormPage />;
}
