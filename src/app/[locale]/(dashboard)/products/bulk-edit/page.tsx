import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { BulkEditProductsPage } from '@/features/products/components/bulk-edit-products-page';

export default async function ProductsBulkEditPage() {
  await requirePermission(PERMISSIONS.PRODUCTS_ACCESS, PERMISSIONS.PRODUCTS_EDIT);
  return <BulkEditProductsPage />;
}
