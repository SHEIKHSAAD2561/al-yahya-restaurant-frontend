'use client';

import { useState } from 'react';
import { ChevronRight, PackageX, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { QueryErrorState } from '@/components/ui/query-error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/core/i18n/navigation';
import { usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { useCategoriesQuery } from '@/features/categories/hooks/use-categories-query';
import { useBrandsQuery } from '@/features/brands/hooks/use-brands-query';
import { useProductQuery } from '../hooks/use-product-query';
import { useProductFormOptionsQuery } from '../hooks/use-product-form-options-query';
import { PRODUCT_TYPES, type ProductType } from '../types/product';
import { ProductTypePicker } from './product-type-picker';
import { ProductForm, type ProductFormMode } from './product-form';

/** Loads everything the form needs up front, then mounts it keyed — see
 * ProductForm's doc comment. */
export function ProductFormPage({ mode, productId }: { mode: ProductFormMode; productId?: string }) {
  const t = useTranslations('products');
  const canEdit = usePermission(PERMISSIONS.PRODUCTS_EDIT);
  const formOptionsQuery = useProductFormOptionsQuery();
  const categoriesQuery = useCategoriesQuery();
  const brandsQuery = useBrandsQuery();
  const productQuery = useProductQuery(productId);

  const [newType, setNewType] = useState<ProductType>(PRODUCT_TYPES.SIMPLE);
  const [newFormCount, setNewFormCount] = useState(0);

  const product = productQuery.data;
  const title = mode === 'create' ? t('newProduct') : (product?.name ?? '');

  const header = (
    <div className="flex items-center justify-between gap-4">
      <nav className="flex items-center gap-1 text-sm">
        <Link href="/products" className="text-brand hover:underline">
          {t('title')}
        </Link>
        <ChevronRight className="size-4 text-zinc-400 rtl:rotate-180" />
        <span className="text-zinc-700">{title}</span>
      </nav>
      {mode === 'view' && canEdit && product && (
        <Button asChild>
          <Link href={`/products/${product.id}/edit`}>
            <Pencil className="size-4" />
            {t('editProduct')}
          </Link>
        </Button>
      )}
    </div>
  );

  if (productId && productQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4">
        {header}
        <EmptyState icon={PackageX} title={t('notFound')} />
      </div>
    );
  }

  const loading =
    formOptionsQuery.isPending ||
    categoriesQuery.isPending ||
    brandsQuery.isPending ||
    (Boolean(productId) && productQuery.isPending);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4">
        {header}
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (formOptionsQuery.isError || !formOptionsQuery.data) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4">
        {header}
        <QueryErrorState onRetry={() => void formOptionsQuery.refetch()} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      {header}
      <ProductTypePicker
        value={product?.type ?? newType}
        onChange={mode === 'create' ? setNewType : undefined}
        disabled={mode !== 'create'}
      />
      <ProductForm
        key={product ? `${product.id}|${product.updatedAt}` : `${newType}|${newFormCount}`}
        mode={mode}
        product={product}
        type={newType}
        formOptions={formOptionsQuery.data}
        categories={categoriesQuery.data ?? []}
        brands={brandsQuery.data ?? []}
        onSaveAndNew={() => setNewFormCount((count) => count + 1)}
      />
    </div>
  );
}
