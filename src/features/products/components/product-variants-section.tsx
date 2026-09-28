'use client';

import { useState } from 'react';
import { Loader2, Trash2, X } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { cn } from '@/lib/utils';
import { productsApi } from '../api/products.api';
import type { ProductFormOptions } from '../types/product';
import type { ProductFormValues } from '../schemas/product-form.schema';
import { syncVariantsWithOptions } from '../utils/product-form-values';
import { FormSection } from './form-section';

const MAX_OPTIONS = 3;

/**
 * VARIABLE products only: options ("Size": S, M, L) on top, and one variant
 * per combination below. Variants are re-derived from options on every
 * option edit (event handlers, not an effect), keeping each surviving
 * combination's SKU, prices and id.
 */
export function ProductVariantsSection({
  formOptions,
  readOnly,
}: {
  formOptions: ProductFormOptions;
  readOnly: boolean;
}) {
  const t = useTranslations('products');
  const canViewCost = usePermission(PERMISSIONS.PRODUCTS_VIEW_COST);
  const {
    control,
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<ProductFormValues>();
  const options = useWatch({ control, name: 'options' });
  const variants = useWatch({ control, name: 'variants' });
  const [newOptionName, setNewOptionName] = useState('');
  const [valueDrafts, setValueDrafts] = useState<Record<number, string>>({});
  const [generating, setGenerating] = useState(false);

  function applyOptions(next: ProductFormValues['options']) {
    setValue('options', next, { shouldDirty: true });
    setValue('variants', syncVariantsWithOptions(next, getValues('variants'), formOptions), {
      shouldDirty: true,
    });
  }

  function addOption() {
    const name = newOptionName.trim();
    if (!name || options.length >= MAX_OPTIONS) return;
    if (options.some((option) => option.name.trim().toLowerCase() === name.toLowerCase())) return;
    // No values yet — contributes no combinations until it gets one.
    setValue('options', [...options, { name, values: [] }], { shouldDirty: true });
    setNewOptionName('');
  }

  function addValue(index: number) {
    const value = (valueDrafts[index] ?? '').trim();
    if (!value) return;
    const option = options[index];
    if (option.values.some((existing) => existing.toLowerCase() === value.toLowerCase())) return;
    applyOptions(options.map((o, i) => (i === index ? { ...o, values: [...o.values, value] } : o)));
    setValueDrafts((drafts) => ({ ...drafts, [index]: '' }));
  }

  function removeValue(index: number, value: string) {
    applyOptions(
      options.map((o, i) => (i === index ? { ...o, values: o.values.filter((v) => v !== value) } : o)),
    );
  }

  function removeOption(index: number) {
    applyOptions(options.filter((_, i) => i !== index));
  }

  async function autoGenerateSkus() {
    setGenerating(true);
    try {
      for (const [index, variant] of getValues('variants').entries()) {
        if (variant.sku.trim()) continue;
        const { sku } = await productsApi.generateSku();
        setValue(`variants.${index}.sku`, sku, { shouldDirty: true, shouldValidate: true });
      }
    } finally {
      setGenerating(false);
    }
  }

  const invalid = 'border-red-500 focus-visible:ring-red-500';

  return (
    <FormSection title={t('form.variants')} hint={t('form.variantsHint')}>
      <div className="space-y-4">
        <div className="grid gap-4 text-sm sm:grid-cols-[14rem_1fr]">
          <div>
            <p className="font-semibold text-zinc-900">
              <span className="text-red-600">*</span> {t('form.options')}
            </p>
            <p className="text-xs text-zinc-500">{t('form.optionsExample')}</p>
          </div>
          <div className="hidden sm:block">
            <p className="font-semibold text-zinc-900">
              <span className="text-red-600">*</span> {t('form.optionValues')}
            </p>
            <p className="text-xs text-zinc-500">{t('form.optionValuesExample')}</p>
          </div>
        </div>

        {options.map((option, index) => (
          <div key={option.name} className="grid gap-4 sm:grid-cols-[14rem_1fr]">
            <div className="flex items-center gap-2">
              <Input value={option.name} disabled className="flex-1" />
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  aria-label={t('form.removeOption')}
                  className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {option.values.map((value) => (
                <span
                  key={value}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-muted px-2.5 py-1 text-xs font-medium text-brand"
                >
                  {value}
                  {!readOnly && (
                    <button type="button" onClick={() => removeValue(index, value)} aria-label="×">
                      <X className="size-3" />
                    </button>
                  )}
                </span>
              ))}
              {!readOnly && (
                <div>
                  <Input
                    value={valueDrafts[index] ?? ''}
                    placeholder={t('form.enterValue')}
                    className="w-40"
                    onChange={(event) =>
                      setValueDrafts((drafts) => ({ ...drafts, [index]: event.target.value }))
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addValue(index);
                      }
                    }}
                    onBlur={() => addValue(index)}
                  />
                  <p className="mt-1 text-[11px] text-zinc-400">{t('form.pressEnterToAdd')}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {!readOnly && options.length < MAX_OPTIONS && (
          <div className="sm:w-56">
            <Input
              value={newOptionName}
              placeholder={t('form.enterOptionName')}
              className={cn(errors.options && options.length === 0 && invalid)}
              onChange={(event) => setNewOptionName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addOption();
                }
              }}
              onBlur={addOption}
            />
            <p className="mt-1 text-[11px] text-zinc-400">{t('form.addOptionHint')}</p>
          </div>
        )}

        <div className="border-t border-zinc-100 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-900">
              {t('form.variantsCount', { count: variants.length })}
            </p>
            {!readOnly && variants.length > 0 && (
              <button
                type="button"
                onClick={() => void autoGenerateSkus()}
                disabled={generating}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand disabled:opacity-50"
              >
                {generating && <Loader2 className="size-4 animate-spin" />}
                {t('form.autoGenerateVariantSkus')}
              </button>
            )}
          </div>

          {variants.length === 0 ? (
            <p className="text-sm text-zinc-400">{t('form.noVariantsYet')}</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-zinc-200">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-xs text-zinc-500">
                  <tr>
                    <th className="px-3 py-2 text-start font-medium">{t('form.variant')}</th>
                    <th className="px-3 py-2 text-start font-medium">
                      <span className="text-red-600">*</span> {t('form.sku')}
                    </th>
                    <th className="px-3 py-2 text-start font-medium">{t('form.barcode')}</th>
                    {canViewCost && <th className="px-3 py-2 text-start font-medium">{t('form.initialCost')}</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {variants.map((variant, index) => (
                    <tr key={variant.id ?? variant.label}>
                      <td className="px-3 py-2 font-medium text-zinc-900">{variant.label}</td>
                      <td className="px-3 py-2">
                        <Input
                          dir="ltr"
                          className={cn('h-9', errors.variants?.[index]?.sku && invalid)}
                          {...register(`variants.${index}.sku`)}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input dir="ltr" className="h-9" {...register(`variants.${index}.barcode`)} />
                      </td>
                      {canViewCost && (
                        <td className="px-3 py-2">
                          {variant.id ? (
                            // Cost of a saved variant is its weighted average —
                            // moved by purchases/stock operations, not this form.
                            <span className="text-zinc-600">{variant.currentCost ?? 0}</span>
                          ) : (
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              className="h-9 w-28"
                              {...register(`variants.${index}.cost`)}
                            />
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </FormSection>
  );
}
