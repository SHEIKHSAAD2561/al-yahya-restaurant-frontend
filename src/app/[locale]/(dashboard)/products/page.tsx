import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { ProductsPage } from '@/features/products/components/products-page';

export default async function ProductsRoutePage() {
  await requirePermission(PERMISSIONS.PRODUCTS_ACCESS);
  return <ProductsPage />;
}
