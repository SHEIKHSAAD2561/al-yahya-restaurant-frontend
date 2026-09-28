'use client';

import { useState } from 'react';
import { Info, Loader2, RefreshCw } from 'lucide-react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { productsApi } from '../api/products.api';
import { PRODUCT_TYPES } from '../types/product';
import type { ProductFormValues } from '../schemas/product-form.schema';
import { FormSection } from './form-section';

export function ProductDetailsSection({ readOnly }: { readOnly: boolean }) {
  const t = useTranslations('products');
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<ProductFormValues>();
  const type = useWatch({ control, name: 'type' });
  const [generating, setGenerating] = useState(false);
  // A VARIABLE product's SKUs/barcodes live on each variant instead.
  const hasSingleVariant = type !== PRODUCT_TYPES.VARIABLE;

  async function generateSku() {
    setGenerating(true);
    try {
      const { sku } = await productsApi.generateSku();
      setValue('variants.0.sku', sku, { shouldDirty: true, shouldValidate: true });
    } finally {
      setGenerating(false);
    }
  }

  const invalid = 'border-red-500 focus-visible:ring-red-500';

  return (
    <FormSection title={t('form.productDetails')} hint={t('form.productDetailsHint')}>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="productName">
            <span className="text-red-600">*</span> {t(`form.nameLabel.${type}`)}
          </Label>
          <Input id="productName" className={cn(errors.name && invalid)} {...register('name')} />
        </div>

        {hasSingleVariant && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="productSku">
                <span className="text-red-600">*</span> {t('form.sku')}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="productSku"
                  dir="ltr"
                  className={cn('flex-1', errors.variants?.[0]?.sku && invalid)}
                  {...register('variants.0.sku')}
                />
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => void generateSku()}
                    disabled={generating}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-muted px-3 text-sm font-medium text-brand hover:bg-brand-muted/70 disabled:opacity-50"
                  >
                    {generating ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                    {t('form.autoGenerateSku')}
                  </button>
                )}
              </div>
              <p className="text-xs text-zinc-500">{t('form.skuHint')}</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="productBarcode">{t('form.barcode')}</Label>
              <Input id="productBarcode" dir="ltr" {...register('variants.0.barcode')} />
            </div>
          </>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="productDescription">{t('form.description')}</Label>
          <Input id="productDescription" {...register('description')} />
        </div>

        <div className="space-y-2">
          <CheckboxField name="isSellable" label={t('form.sellable')} hint={t('form.sellableHint')} />
          {type === PRODUCT_TYPES.SIMPLE && (
            <CheckboxField name="isPurchasable" label={t('form.purchasable')} hint={t('form.purchasableHint')} />
          )}
        </div>
      </div>
    </FormSection>
  );
}

export function CheckboxField({
  name,
  label,
  hint,
  disabled,
}: {
  name: 'isSellable' | 'isPurchasable' | 'trackQuantity' | 'isWeighted';
  label: string;
  hint?: string;
  disabled?: boolean;
}) {
  const { control } = useFormContext<ProductFormValues>();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-zinc-800">
          <Checkbox
            checked={field.value}
            disabled={disabled}
            onCheckedChange={(checked) => field.onChange(checked === true)}
          />
          <span className="font-medium">{label}</span>
          {hint && (
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <Info className="size-3.5" />
              {hint}
            </span>
          )}
        </label>
      )}
    />
  );
}
