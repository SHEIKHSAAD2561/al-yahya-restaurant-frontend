import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { ProductFormPage } from '@/features/products/components/product-form-page';

export default async function ViewProductPage({ params }: { params: Promise<{ productId: string }> }) {
  await requirePermission(PERMISSIONS.PRODUCTS_ACCESS);
  const { productId } = await params;
  return <ProductFormPage mode="view" productId={productId} />;
}
