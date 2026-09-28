'use client';

import { useState } from 'react';
import { ChevronDown, Copy, Info } from 'lucide-react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumberStepper } from '@/components/ui/number-stepper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { cn } from '@/lib/utils';
import { PRODUCT_TYPES, type ProductFormOptions } from '../types/product';
import type { ProductFormValues } from '../schemas/product-form.schema';
import { CheckboxField } from './product-details-section';
import { FormSection } from './form-section';

const PRICE_FIELDS = ['retailPrice', 'wholesalePrice', 'buyPrice', 'taxId'] as const;

/**
 * Product-level stock settings, then one block per location with a row per
 * variant (one row for SIMPLE/COMPOSITE). Visibility follows permissions the
 * same way the backend trims its responses: cost/buy price need
 * `products.view_cost`, quantities need `stock.access`. Quantity and cost are
 * only *enterable* for a not-yet-saved variant (initial values); afterwards
 * stock operations and purchases own them.
 */
export function StockPricingSection({
  formOptions,
  readOnly,
}: {
  formOptions: ProductFormOptions;
  readOnly: boolean;
}) {
  const t = useTranslations('products');
  const canViewCost = usePermission(PERMISSIONS.PRODUCTS_VIEW_COST);
  const canSeeStock = usePermission(PERMISSIONS.STOCK_ACCESS);
  const { control, register, getValues, setValue } = useFormContext<ProductFormValues>();
  const [type, variants, components, trackQuantity] = useWatch({
    control,
    name: ['type', 'variants', 'components', 'trackQuantity'],
  });
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const isComposite = type === PRODUCT_TYPES.COMPOSITE;
  const isVariable = type === PRODUCT_TYPES.VARIABLE;
  const showBuyPrice = canViewCost && !isComposite;
  const firstVariant = variants[0];
  const priceSuffix = t(`form.tax${formOptions.sellTaxStatus === 'INCLUSIVE' ? 'Inclusive' : 'Exclusive'}`);
  const taxName = (id: string) => formOptions.taxes.find((tax) => tax.id === id)?.name;

  // Composite cost is derived: Σ(component cost × quantity).
  const compositeCost = components.reduce(
    (sum, component) => sum + (component.cost ?? 0) * (Number(component.quantity) || 0),
    0,
  );

  function copyToAllLocations(sourceIndex: number) {
    getValues('variants').forEach((variant, variantIndex) => {
      const source = variant.locations[sourceIndex];
      variant.locations.forEach((_, locationIndex) => {
        if (locationIndex === sourceIndex) return;
        for (const field of PRICE_FIELDS) {
          setValue(`variants.${variantIndex}.locations.${locationIndex}.${field}`, source[field], {
            shouldDirty: true,
          });
        }
      });
    });
  }

  return (
    <FormSection title={t('form.stockPricing')} hint={t('form.stockPricingHint')}>
      <div className="space-y-4">
        {canViewCost && !isVariable && (
          <div className="max-w-60 space-y-1.5">
            <Label htmlFor="initialCost">
              {isComposite ? t('columns.cost') : t('form.initialCost')}
            </Label>
            {isComposite ? (
              <Input id="initialCost" value={compositeCost.toFixed(2)} disabled readOnly />
            ) : firstVariant?.id ? (
              <Input id="initialCost" value={firstVariant.currentCost ?? 0} disabled readOnly />
            ) : (
              <Input id="initialCost" type="number" step="0.01" min="0" {...register('variants.0.cost')} />
            )}
          </div>
        )}

        {!isComposite && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="reorderPoint">{t('form.reorderPoint')}</Label>
              <Controller
                control={control}
                name="reorderPoint"
                render={({ field }) => (
                  <NumberStepper
                    id="reorderPoint"
                    value={field.value}
                    onChange={field.onChange}
                    min={0}
                    max={1_000_000}
                    disabled={readOnly}
                  />
                )}
              />
              <p className="flex max-w-md gap-1.5 text-xs text-zinc-500">
                <Info className="mt-0.5 size-3.5 shrink-0" />
                {t('form.reorderPointHint')}
              </p>
            </div>
            <div className="space-y-1">
              <CheckboxField name="trackQuantity" label={t('form.trackQuantity')} />
              <p className="ps-7 text-xs text-zinc-500">{t('form.trackQuantityHint')}</p>
            </div>
            <CheckboxField name="isWeighted" label={t('form.weighted')} hint={t('form.weightedHint')} />
          </>
        )}

        <div className="space-y-3 border-t border-zinc-100 pt-4">
          {variants.length === 0 && <p className="text-sm text-zinc-400">{t('form.noVariantsYet')}</p>}
          {variants.length > 0 &&
            formOptions.locations.map((location, locationIndex) => {
              const isCollapsed = collapsed[location.id] ?? false;
              return (
                <div key={location.id} className="rounded-lg border border-zinc-200">
                  <div className="flex items-center justify-between gap-2 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setCollapsed((state) => ({ ...state, [location.id]: !isCollapsed }))}
                      className="flex items-center gap-2 text-sm font-semibold text-zinc-900"
                    >
                      <ChevronDown className={cn('size-4 transition-transform', isCollapsed && '-rotate-90')} />
                      {location.name}
                    </button>
                    {!readOnly && formOptions.locations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => copyToAllLocations(locationIndex)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-brand"
                      >
                        <Copy className="size-3.5" />
                        {t('form.copyToAllLocations')}
                      </button>
                    )}
                  </div>

                  {!isCollapsed && (
                    <div className="overflow-x-auto border-t border-zinc-100">
                      <table className="w-full text-sm">
                        <thead className="text-xs text-zinc-500">
                          <tr>
                            {isVariable && <th className="px-3 py-2 text-start font-medium">{t('form.variant')}</th>}
                            {canSeeStock && (
                              <th className="px-3 py-2 text-start font-medium">
                                {isComposite ? t('form.maxToSell') : t('form.initialQuantity')}
                              </th>
                            )}
                            <th className="px-3 py-2 text-start font-medium">
                              {t('columns.retailPrice')}
                              <span className="block font-normal">{priceSuffix}</span>
                            </th>
                            <th className="px-3 py-2 text-start font-medium">
                              {t('columns.wholesalePrice')}
                              <span className="block font-normal">{priceSuffix}</span>
                            </th>
                            {showBuyPrice && <th className="px-3 py-2 text-start font-medium">{t('form.buyPrice')}</th>}
                            <th className="px-3 py-2 text-start font-medium">{t('form.taxType')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {variants.map((variant, variantIndex) => {
                            const row = variant.locations[locationIndex];
                            if (!row) return null;
                            const base = `variants.${variantIndex}.locations.${locationIndex}` as const;
                            return (
                              <tr key={variant.id ?? variant.label ?? variantIndex}>
                                {isVariable && <td className="px-3 py-2 font-medium text-zinc-900">{variant.label}</td>}
                                {canSeeStock && (
                                  <td className="px-3 py-2">
                                    {isComposite || variant.id ? (
                                      <span className="text-zinc-600">{row.currentQuantity ?? '—'}</span>
                                    ) : (
                                      <Input
                                        type="number"
                                        step="0.001"
                                        min="0"
                                        className="h-9 w-24"
                                        disabled={!trackQuantity}
                                        {...register(`${base}.quantity`)}
                                      />
                                    )}
                                  </td>
                                )}
                                <td className="px-3 py-2">
                                  <Input type="number" step="0.01" min="0" className="h-9 w-28" {...register(`${base}.retailPrice`)} />
                                </td>
                                <td className="px-3 py-2">
                                  <Input type="number" step="0.01" min="0" className="h-9 w-28" {...register(`${base}.wholesalePrice`)} />
                                </td>
                                {showBuyPrice && (
                                  <td className="px-3 py-2">
                                    <Input type="number" step="0.01" min="0" className="h-9 w-28" {...register(`${base}.buyPrice`)} />
                                  </td>
                                )}
                                <td className="px-3 py-2">
                                  <Controller
                                    control={control}
                                    name={`${base}.taxId`}
                                    render={({ field }) => (
                                      <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="h-9 w-40">
                                          <SelectValue placeholder={t('form.select')}>
                                            {field.value ? taxName(field.value) : undefined}
                                          </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                          {formOptions.taxes.map((tax) => (
                                            <SelectItem key={tax.id} value={tax.id}>
                                              {tax.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </FormSection>
  );
}
