'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from '@/core/i18n/navigation';
import { usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import type { Category } from '@/features/categories/types/category';
import type { Brand } from '@/features/brands/types/brand';
import { useSaveProductMutation } from '../hooks/use-save-product-mutation';
import { productFormSchema, type ProductFormValues } from '../schemas/product-form.schema';
import {
  PRODUCT_TYPES,
  type Product,
  type ProductFormOptions,
  type ProductType,
} from '../types/product';
import { newProductDefaults, productDefaults, toProductInput } from '../utils/product-form-values';
import { ProductDetailsSection } from './product-details-section';
import { ProductImagesSection } from './product-images-section';
import { ItemSourceSection } from './item-source-section';
import { ProductVariantsSection } from './product-variants-section';
import { CompositeComponentsSection } from './composite-components-section';
import { StockPricingSection } from './stock-pricing-section';
import { ClassificationSection } from './classification-section';
import { ShippingSection } from './shipping-section';

export type ProductFormMode = 'create' | 'edit' | 'view';

interface ProductFormProps {
  mode: ProductFormMode;
  /** Required for edit/view; its type wins over `type`. */
  product?: Product;
  type: ProductType;
  formOptions: ProductFormOptions;
  categories: Category[];
  brands: Brand[];
  /** "Save and New" — the parent remounts a blank form. */
  onSaveAndNew: () => void;
}

/**
 * One form for all three product types and all three modes. Its parent keys
 * it (by `updatedAt` for a saved product, by type + a counter for a new one),
 * so `defaultValues` are always built from props — never reset() in an
 * effect (see CLAUDE.md's React Compiler + react-hook-form note).
 */
export function ProductForm({
  mode,
  product,
  type,
  formOptions,
  categories,
  brands,
  onSaveAndNew,
}: ProductFormProps) {
  const t = useTranslations('products');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const canViewCost = usePermission(PERMISSIONS.PRODUCTS_VIEW_COST);
  const canSetStock = usePermission(PERMISSIONS.STOCK_ACCESS);
  const saveMutation = useSaveProductMutation();
  const readOnly = mode === 'view';
  const productType = product?.type ?? type;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product ? productDefaults(product, formOptions) : newProductDefaults(type, formOptions),
  });

  function save(values: ProductFormValues, andNew: boolean) {
    const input = toProductInput(values, { canViewCost, canSetStock });
    saveMutation.mutate(product ? { id: product.id, input } : { input: { ...input, type: values.type } }, {
      onSuccess: () => (andNew ? onSaveAndNew() : router.push('/products')),
    });
  }

  const onInvalid = () => toast.error(t('form.fixErrors'));

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((values) => save(values, false), onInvalid)} noValidate>
        {/* A disabled <fieldset> disables every native control and Radix
            trigger (they're <button>s) inside it — the whole view mode. */}
        <fieldset disabled={readOnly} className="space-y-4">
          <ProductDetailsSection readOnly={readOnly} />
          <ProductImagesSection readOnly={readOnly} />
          {productType === PRODUCT_TYPES.SIMPLE && <ItemSourceSection />}
          {productType === PRODUCT_TYPES.VARIABLE && (
            <ProductVariantsSection formOptions={formOptions} readOnly={readOnly} />
          )}
          {productType === PRODUCT_TYPES.COMPOSITE && <CompositeComponentsSection readOnly={readOnly} />}
          <StockPricingSection formOptions={formOptions} readOnly={readOnly} />
          <ClassificationSection categories={categories} brands={brands} readOnly={readOnly} />
          {productType !== PRODUCT_TYPES.VARIABLE && <ShippingSection formOptions={formOptions} />}
        </fieldset>

        {!readOnly && (
          <div className="mt-4 flex items-center justify-end gap-2 rounded-2xl border border-zinc-200 bg-white p-4">
            <Button asChild variant="ghost">
              <Link href="/products">{tCommon('cancel')}</Link>
            </Button>
            {mode === 'create' && (
              <Button
                type="button"
                variant="outline"
                disabled={saveMutation.isPending}
                onClick={form.handleSubmit((values) => save(values, true), onInvalid)}
              >
                {t('form.saveAndNew')}
              </Button>
            )}
            <Button type="submit" disabled={saveMutation.isPending}>
              {tCommon('save')}
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
