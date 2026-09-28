'use client';

import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { ChevronRight, Info, PackageX } from 'lucide-react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { QueryErrorState } from '@/components/ui/query-error-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { Link, useRouter } from '@/core/i18n/navigation';
import { usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { productsApi, type BulkPricingItemInput } from '../api/products.api';
import { productsKeys } from '../api/products.query-keys';
import { useBulkUpdatePricingMutation } from '../hooks/use-bulk-update-pricing-mutation';
import { useProductFormOptionsQuery } from '../hooks/use-product-form-options-query';
import { clearBulkEditSelection, loadBulkEditSelection } from '../utils/bulk-edit-selection';
import { PRODUCT_TYPES } from '../types/product';
import type { Product } from '../types/product';

type FieldKey = 'retailPrice' | 'wholesalePrice' | 'buyPrice' | 'taxId' | 'reorderPoint';

interface BulkEditRow {
  variantId: string;
  productId: string;
  name: string;
  sku: string;
  cost: number | undefined;
  isComposite: boolean;
  currentRetail: string;
  currentWholesale: string;
  currentBuy: string;
  currentTaxId: string;
  currentReorderPoint: string;
}

const toText = (value: number | null | undefined) =>
  value === null || value === undefined ? '' : String(value);
const toNumberOrNull = (value: string) => (value.trim() === '' ? null : Number(value));
const variantName = (product: Product, variantId: string) => {
  const variant = product.variants.find((candidate) => candidate.id === variantId);
  if (!variant) return null;
  const name =
    product.type === PRODUCT_TYPES.VARIABLE && variant.optionValues?.length
      ? `${product.name} - ${variant.optionValues.join(' / ')}`
      : product.name;
  return { name, variant };
};

/**
 * "Bulk Edit Products Info": edit prices/tax/re-order point for the rows
 * selected on the products list, at one location at a time. Reads its
 * selection from sessionStorage (see bulk-edit-selection.ts) rather than the
 * URL — a couple hundred UUIDs would make the URL unwieldy.
 */
export function BulkEditProductsPage() {
  const t = useTranslations('products');
  const router = useRouter();
  const canViewCost = usePermission(PERMISSIONS.PRODUCTS_VIEW_COST);
  const formOptionsQuery = useProductFormOptionsQuery();
  const [selection] = useState(loadBulkEditSelection);
  const [locationOverride, setLocationOverride] = useState<string | null>(null);

  const uniqueProductIds = useMemo(() => [...new Set(selection.map((row) => row.productId))], [selection]);
  const productQueries = useQueries({
    queries: uniqueProductIds.map((id) => ({
      queryKey: productsKeys.detail(id),
      queryFn: () => productsApi.get(id),
    })),
  });
  const loadingProducts = productQueries.some((query) => query.isPending);
  const productsById = useMemo(() => {
    const map = new Map<string, Product>();
    for (const query of productQueries) {
      if (query.data) map.set(query.data.id, query.data);
    }
    return map;
  }, [productQueries]);

  const header = (
    <nav className="flex items-center gap-1 text-sm">
      <Link href="/products" className="text-brand hover:underline">
        {t('title')}
      </Link>
      <ChevronRight className="size-4 text-zinc-400 rtl:rotate-180" />
      <span className="text-zinc-700">{t('form.bulkEditTitle')}</span>
    </nav>
  );

  if (selection.length === 0) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4">
        {header}
        <EmptyState
          icon={PackageX}
          title={t('form.bulkEditNoSelection')}
          action={
            <Button asChild variant="outline">
              <Link href="/products">{t('form.backToProducts')}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (formOptionsQuery.isPending || loadingProducts) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4">
        {header}
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (formOptionsQuery.isError || !formOptionsQuery.data) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4">
        {header}
        <QueryErrorState onRetry={() => void formOptionsQuery.refetch()} />
      </div>
    );
  }

  const formOptions = formOptionsQuery.data;
  const defaultLocationId =
    formOptions.locations.find((location) => location.isDefault)?.id ?? formOptions.locations[0]?.id ?? '';
  const locationId = locationOverride ?? defaultLocationId;

  const rows: BulkEditRow[] = selection
    .map((selected) => {
      const product = productsById.get(selected.productId);
      if (!product) return null;
      const resolved = variantName(product, selected.variantId);
      if (!resolved) return null;
      const locationRow = resolved.variant.locations.find((candidate) => candidate.locationId === locationId);
      return {
        variantId: selected.variantId,
        productId: selected.productId,
        name: resolved.name,
        sku: resolved.variant.sku,
        cost: resolved.variant.cost,
        isComposite: product.type === PRODUCT_TYPES.COMPOSITE,
        currentRetail: toText(locationRow?.retailPrice),
        currentWholesale: toText(locationRow?.wholesalePrice),
        currentBuy: toText(locationRow?.buyPrice),
        currentTaxId: locationRow?.taxId ?? '',
        currentReorderPoint: toText(product.reorderPoint),
      };
    })
    .filter((row): row is BulkEditRow => row !== null);

  const skippedCount = selection.length - rows.length;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      {header}
      {skippedCount > 0 && (
        <p className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          <Info className="size-4 shrink-0" />
          {t('form.bulkEditSkipped', { count: skippedCount })}
        </p>
      )}
      <BulkEditForm
        key={`${locationId}|${rows.map((row) => row.variantId).join(',')}`}
        rows={rows}
        formOptions={formOptions}
        locationId={locationId}
        onLocationChange={setLocationOverride}
        canViewCost={canViewCost}
        onDone={() => {
          clearBulkEditSelection();
          router.push('/products');
        }}
      />
    </div>
  );
}

function BulkEditForm({
  rows,
  formOptions,
  locationId,
  onLocationChange,
  canViewCost,
  onDone,
}: {
  rows: BulkEditRow[];
  formOptions: { locations: { id: string; name: string }[]; taxes: { id: string; name: string }[] };
  locationId: string;
  onLocationChange: (locationId: string) => void;
  canViewCost: boolean;
  onDone: () => void;
}) {
  const t = useTranslations('products');
  const tCommon = useTranslations('common');
  const bulkMutation = useBulkUpdatePricingMutation();

  const [toggles, setToggles] = useState<Record<FieldKey, boolean>>({
    retailPrice: true,
    wholesalePrice: true,
    buyPrice: true,
    taxId: true,
    reorderPoint: true,
  });

  const { control, register, handleSubmit } = useForm({
    defaultValues: {
      rows: rows.map((row) => ({
        retailPrice: row.currentRetail,
        wholesalePrice: row.currentWholesale,
        buyPrice: row.currentBuy,
        taxId: row.currentTaxId,
        reorderPoint: row.currentReorderPoint,
      })),
    },
  });
  const currentRows = useWatch({ control, name: 'rows' });
  const taxName = (id: string) => formOptions.taxes.find((tax) => tax.id === id)?.name;

  function isRowChanged(index: number): boolean {
    const initial = rows[index];
    const current = currentRows[index];
    return (
      (toggles.retailPrice && current.retailPrice !== initial.currentRetail) ||
      (toggles.wholesalePrice && current.wholesalePrice !== initial.currentWholesale) ||
      (toggles.buyPrice && canViewCost && current.buyPrice !== initial.currentBuy) ||
      (toggles.taxId && current.taxId !== initial.currentTaxId) ||
      (toggles.reorderPoint && !initial.isComposite && current.reorderPoint !== initial.currentReorderPoint)
    );
  }

  const changedCount = rows.reduce((count, _row, index) => count + (isRowChanged(index) ? 1 : 0), 0);

  function onSubmit(values: { rows: { retailPrice: string; wholesalePrice: string; buyPrice: string; taxId: string; reorderPoint: string }[] }) {
    const items = values.rows.reduce<BulkPricingItemInput[]>((accumulator, current, index) => {
      if (!isRowChanged(index)) return accumulator;
      const initial = rows[index];
      const item: BulkPricingItemInput = { variantId: initial.variantId };
      if (toggles.retailPrice && current.retailPrice !== initial.currentRetail) {
        item.retailPrice = toNumberOrNull(current.retailPrice);
      }
      if (toggles.wholesalePrice && current.wholesalePrice !== initial.currentWholesale) {
        item.wholesalePrice = toNumberOrNull(current.wholesalePrice);
      }
      if (toggles.buyPrice && canViewCost && current.buyPrice !== initial.currentBuy) {
        item.buyPrice = toNumberOrNull(current.buyPrice);
      }
      if (toggles.taxId && current.taxId !== initial.currentTaxId) {
        item.taxId = current.taxId || null;
      }
      if (toggles.reorderPoint && !initial.isComposite && current.reorderPoint !== initial.currentReorderPoint) {
        item.reorderPoint = current.reorderPoint.trim() === '' ? null : Number(current.reorderPoint);
      }
      accumulator.push(item);
      return accumulator;
    }, []);

    bulkMutation.mutate({ locationId, items }, { onSuccess: onDone });
  }

  const fieldToggle = (key: FieldKey, label: string) => (
    <label className="flex items-center gap-2 text-sm text-zinc-700">
      <Checkbox
        checked={toggles[key]}
        onCheckedChange={(checked) => setToggles((state) => ({ ...state, [key]: checked === true }))}
      />
      {label}
    </label>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-zinc-500">{t('form.selectedProducts')}</p>
          <p className="text-sm font-semibold text-zinc-900">{rows.length}</p>
        </div>
        <div className="w-56 space-y-1.5">
          <p className="text-xs font-medium text-zinc-500">{t('form.selectedLocation')}</p>
          <Select value={locationId} onValueChange={onLocationChange}>
            <SelectTrigger>
              <SelectValue>{formOptions.locations.find((location) => location.id === locationId)?.name}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {formOptions.locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-zinc-900">{t('form.selectFieldsToEdit')}</p>
        <div className="flex flex-wrap gap-4">
          {fieldToggle('retailPrice', t('columns.retailPrice'))}
          {fieldToggle('wholesalePrice', t('columns.wholesalePrice'))}
          {canViewCost && fieldToggle('buyPrice', t('form.buyPrice'))}
          {fieldToggle('taxId', t('form.taxType'))}
          {fieldToggle('reorderPoint', t('form.reorderPoint'))}
        </div>
      </div>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>{t('columns.productName')}</TableHeaderCell>
            <TableHeaderCell>{t('columns.sku')}</TableHeaderCell>
            {canViewCost && <TableHeaderCell>{t('columns.cost')}</TableHeaderCell>}
            {toggles.retailPrice && <TableHeaderCell>{t('columns.retailPrice')}</TableHeaderCell>}
            {toggles.wholesalePrice && <TableHeaderCell>{t('columns.wholesalePrice')}</TableHeaderCell>}
            {canViewCost && toggles.buyPrice && <TableHeaderCell>{t('form.buyPrice')}</TableHeaderCell>}
            {toggles.taxId && <TableHeaderCell>{t('form.taxType')}</TableHeaderCell>}
            {toggles.reorderPoint && <TableHeaderCell>{t('form.reorderPoint')}</TableHeaderCell>}
          </tr>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={row.variantId}>
              <TableCell className="font-medium text-zinc-900">{row.name}</TableCell>
              <TableCell dir="ltr" className="rtl:text-end">
                {row.sku}
              </TableCell>
              {/* Already the derived cost for a COMPOSITE — the backend computes that, not this page. */}
              {canViewCost && <TableCell>{row.cost ?? 0}</TableCell>}
              {toggles.retailPrice && (
                <TableCell>
                  <Input type="number" step="0.01" min="0" className="h-9 w-28" {...register(`rows.${index}.retailPrice`)} />
                </TableCell>
              )}
              {toggles.wholesalePrice && (
                <TableCell>
                  <Input type="number" step="0.01" min="0" className="h-9 w-28" {...register(`rows.${index}.wholesalePrice`)} />
                </TableCell>
              )}
              {canViewCost && toggles.buyPrice && (
                <TableCell>
                  <Input type="number" step="0.01" min="0" className="h-9 w-28" {...register(`rows.${index}.buyPrice`)} />
                </TableCell>
              )}
              {toggles.taxId && (
                <TableCell>
                  <Controller
                    control={control}
                    name={`rows.${index}.taxId`}
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
                </TableCell>
              )}
              {toggles.reorderPoint && (
                <TableCell>
                  {row.isComposite ? (
                    <span className="text-zinc-400">—</span>
                  ) : (
                    <Input type="number" min="0" className="h-9 w-24" {...register(`rows.${index}.reorderPoint`)} />
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-end gap-2 rounded-2xl border border-zinc-200 bg-white p-4">
        <Button type="button" variant="ghost" onClick={onDone}>
          {tCommon('cancel')}
        </Button>
        <Button type="submit" disabled={changedCount === 0 || bulkMutation.isPending}>
          {t('form.reviewAndSave', { count: changedCount })}
        </Button>
      </div>
    </form>
  );
}
