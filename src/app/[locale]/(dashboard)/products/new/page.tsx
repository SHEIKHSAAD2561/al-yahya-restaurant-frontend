import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { ProductFormPage } from '@/features/products/components/product-form-page';

export default async function NewProductPage() {
  await requirePermission(PERMISSIONS.PRODUCTS_ACCESS, PERMISSIONS.PRODUCTS_CREATE);
  return <ProductFormPage mode="create" />;
}
