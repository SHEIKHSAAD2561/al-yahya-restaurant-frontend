import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { SuppliersPage } from '@/features/suppliers/components/suppliers-page';

export default async function SuppliersRoutePage() {
  await requirePermission(PERMISSIONS.PURCHASES_SUPPLIERS_ACCESS);
  return <SuppliersPage />;
}
