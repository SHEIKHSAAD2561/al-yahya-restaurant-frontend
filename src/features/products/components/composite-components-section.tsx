'use client';

import { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { useDebouncedValue } from '@/core/hooks/use-debounced-value';
import { cn } from '@/lib/utils';
import { useProductsQuery } from '../hooks/use-products-query';
import type { ProductListItem } from '../types/product';
import type { ProductFormValues } from '../schemas/product-form.schema';
import { FormSection } from './form-section';

/** COMPOSITE products only: pick other (non-composite) products' variants and
 * how many of each one unit of this product consumes. */
export function CompositeComponentsSection({ readOnly }: { readOnly: boolean }) {
  const t = useTranslations('products');
  const canViewCost = usePermission(PERMISSIONS.PRODUCTS_VIEW_COST);
  const {
    control,
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<ProductFormValues>();
  const components = useWatch({ control, name: 'components' });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());

  const resultsQuery = useProductsQuery(
    { search: debouncedSearch, excludeComposite: true, pageSize: 8 },
    debouncedSearch.length > 0,
  );
  const results = (resultsQuery.data?.items ?? []).filter(
    (item) => !components.some((component) => component.variantId === item.variantId),
  );

  function add(item: ProductListItem) {
    setValue(
      'components',
      [
        ...getValues('components'),
        { variantId: item.variantId, name: item.name, sku: item.sku, cost: item.cost, quantity: '1' },
      ],
      { shouldDirty: true, shouldValidate: true },
    );
    setSearch('');
  }

  function remove(variantId: string) {
    setValue(
      'components',
      getValues('components').filter((component) => component.variantId !== variantId),
      { shouldDirty: true },
    );
  }

  return (
    <FormSection title={t('form.components')} hint={t('form.componentsHint')}>
      {!readOnly && (
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('form.searchComponents')}
            className={cn('ps-9', errors.components && components.length === 0 && 'border-red-500')}
          />
          {debouncedSearch && (
            <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-md">
              {resultsQuery.isPending ? (
                <p className="px-3 py-2 text-sm text-zinc-400">{t('form.searching')}</p>
              ) : results.length === 0 ? (
                <p className="px-3 py-2 text-sm text-zinc-400">{t('form.noMatches')}</p>
              ) : (
                results.map((item) => (
                  <button
                    key={item.variantId}
                    type="button"
                    onClick={() => add(item)}
                    className="flex w-full items-center justify-between px-3 py-2 text-start text-sm hover:bg-zinc-50"
                  >
                    <span className="font-medium text-zinc-900">{item.name}</span>
                    <span dir="ltr" className="text-xs text-zinc-500">
                      {item.sku}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {components.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-400">{t('form.noComponents')}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-xs text-zinc-500">
              <tr>
                <th className="px-3 py-2 text-start font-medium">{t('columns.productName')}</th>
                <th className="px-3 py-2 text-start font-medium">{t('columns.sku')}</th>
                {canViewCost && <th className="px-3 py-2 text-start font-medium">{t('columns.cost')}</th>}
                <th className="px-3 py-2 text-start font-medium">{t('form.quantity')}</th>
                {!readOnly && <th className="w-10" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {components.map((component, index) => (
                <tr key={component.variantId}>
                  <td className="px-3 py-2 font-medium text-zinc-900">{component.name}</td>
                  <td dir="ltr" className="px-3 py-2 text-zinc-600 rtl:text-end">
                    {component.sku}
                  </td>
                  {canViewCost && <td className="px-3 py-2 text-zinc-600">{component.cost ?? 0}</td>}
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      step="0.001"
                      min="0.001"
                      className={cn('h-9 w-28', errors.components?.[index]?.quantity && 'border-red-500')}
                      {...register(`components.${index}.quantity`)}
                    />
                  </td>
                  {!readOnly && (
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => remove(component.variantId)}
                        aria-label={t('form.removeComponent')}
                        className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </FormSection>
  );
}
