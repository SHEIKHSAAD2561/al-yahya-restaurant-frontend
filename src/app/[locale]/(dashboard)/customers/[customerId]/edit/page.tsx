import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { CustomerFormPage } from '@/features/customers/components/customer-form-page';

export default async function EditCustomerPage({ params }: { params: Promise<{ customerId: string }> }) {
  await requirePermission(PERMISSIONS.CUSTOMERS_ACCESS, PERMISSIONS.CUSTOMERS_EDIT);
  const { customerId } = await params;
  return <CustomerFormPage customerId={customerId} />;
}
