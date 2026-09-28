import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { ProductFormPage } from '@/features/products/components/product-form-page';

export default async function EditProductPage({ params }: { params: Promise<{ productId: string }> }) {
  await requirePermission(PERMISSIONS.PRODUCTS_ACCESS, PERMISSIONS.PRODUCTS_EDIT);
  const { productId } = await params;
  return <ProductFormPage mode="edit" productId={productId} />;
}
