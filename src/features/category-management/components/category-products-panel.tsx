'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AlertTriangle, ImageIcon, Package, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { useDebouncedValue } from '@/core/hooks/use-debounced-value';
import { useProductsQuery } from '@/features/products/hooks/use-products-query';
import { groupProductsByProduct } from '../utils/group-products';
import type { SelectedBucket } from './category-sidebar';

const PRODUCTS_PAGE_SIZE = 100;

interface CategoryProductsPanelProps {
  bucket: SelectedBucket;
  title: string;
  productCount: number;
  onAssignRow: (productId: string) => void;
  onAssignSelected: (productIds: string[]) => void;
  onUnassignSelected: (productIds: string[]) => void;
  onCreateAndAssign: (checkedProductIds: string[]) => void;
}

export function CategoryProductsPanel({
  bucket,
  title,
  productCount,
  onAssignRow,
  onAssignSelected,
  onUnassignSelected,
  onCreateAndAssign,
}: CategoryProductsPanelProps) {
  const t = useTranslations('categoryManagement');
  const tProducts = useTranslations('products');
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useState<Record<string, true>>({});
  const debouncedSearch = useDebouncedValue(search.trim());

  const productsQuery = useProductsQuery({
    search: debouncedSearch,
    categoryId: bucket.kind === 'category' ? bucket.id : undefined,
    uncategorized: bucket.kind === 'uncategorized',
    sort: 'NAME_ASC',
    pageSize: PRODUCTS_PAGE_SIZE,
  });

  const groups = groupProductsByProduct(productsQuery.data?.items ?? []);
  const total = productsQuery.data?.total ?? 0;
  const checkedIds = Object.keys(checked);

  function toggle(productId: string) {
    setChecked((current) => {
      const next = { ...current };
      if (next[productId]) delete next[productId];
      else next[productId] = true;
      return next;
    });
  }
  function toggleAll() {
    if (groups.length > 0 && groups.every((group) => checked[group.productId])) {
      setChecked({});
    } else {
      setChecked(Object.fromEntries(groups.map((group) => [group.productId, true as const])));
    }
  }

  return (
    <div className="flex-1 space-y-4">
      {bucket.kind === 'uncategorized' && productCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-semibold text-red-800">{t('uncategorizedBannerTitle')}</p>
              <p className="text-sm text-red-700">{t('uncategorizedBannerHint')}</p>
            </div>
          </div>
          <Button size="sm" onClick={() => onCreateAndAssign(checkedIds)}>
            {t('createCategoryAndAssign')}
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-zinc-900">{title}</h1>
        <Badge variant={bucket.kind === 'uncategorized' ? 'danger' : 'brand'}>
          {t('productCount', { count: productCount })}
        </Badge>
      </div>

      <div className="relative w-full sm:w-96">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('searchProductsPlaceholder')}
          className="ps-9"
        />
      </div>

      {checkedIds.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-brand-muted px-3 py-2 text-sm text-zinc-800">
          <span className="font-medium">{t('selectedCount', { count: checkedIds.length })}</span>
          <button type="button" className="font-medium text-brand hover:underline" onClick={() => onAssignSelected(checkedIds)}>
            {t('assignToCategory', { count: checkedIds.length })}
          </button>
          {bucket.kind === 'category' && (
            <button
              type="button"
              className="font-medium text-red-600 hover:underline"
              onClick={() => {
                onUnassignSelected(checkedIds);
                setChecked({});
              }}
            >
              {t('removeFromCategory')}
            </button>
          )}
        </div>
      )}

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell className="w-10">
              <Checkbox
                checked={groups.length > 0 && groups.every((group) => checked[group.productId])}
                disabled={groups.length === 0}
                onCheckedChange={toggleAll}
                aria-label={t('selectAll')}
              />
            </TableHeaderCell>
            <TableHeaderCell>{tProducts('columns.productName')}</TableHeaderCell>
            <TableHeaderCell>{tProducts('form.productType')}</TableHeaderCell>
            <TableHeaderCell>{tProducts('columns.sku')}</TableHeaderCell>
            <TableHeaderCell className="w-24 text-end">{t('action')}</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {productsQuery.isPending ? (
            Array.from({ length: 3 }, (_, index) => (
              <TableRow key={index}>
                <TableCell colSpan={5}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : groups.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="p-0">
                <EmptyState icon={Package} title={t('noProducts')} />
              </TableCell>
            </TableRow>
          ) : (
            groups.map((group) => (
              <TableRow key={group.productId}>
                <TableCell>
                  <Checkbox
                    checked={Boolean(checked[group.productId])}
                    onCheckedChange={() => toggle(group.productId)}
                    aria-label={t('selectRow')}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 text-zinc-300">
                      {group.imageUrl ? (
                        <Image src={group.imageUrl} alt="" fill className="object-cover" unoptimized />
                      ) : (
                        <ImageIcon className="size-4" />
                      )}
                    </span>
                    <span className="font-medium text-zinc-900">{group.name}</span>
                    <Badge>{t('variantCount', { count: group.variants.length })}</Badge>
                  </div>
                </TableCell>
                <TableCell>{tProducts(`types.${group.type}`)}</TableCell>
                <TableCell dir="ltr" className="rtl:text-end">
                  {group.variants[0]?.sku}
                  {group.variants.length > 1 && (
                    <span className="ms-1 text-xs text-zinc-400">+{group.variants.length - 1}</span>
                  )}
                </TableCell>
                <TableCell className="text-end">
                  <button
                    type="button"
                    onClick={() => onAssignRow(group.productId)}
                    className="text-sm font-medium text-brand hover:underline"
                  >
                    {bucket.kind === 'uncategorized' ? t('assign') : t('move')}
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {total > PRODUCTS_PAGE_SIZE && (
        <p className="text-xs text-zinc-400">{t('truncatedResults', { shown: PRODUCTS_PAGE_SIZE, total })}</p>
      )}
    </div>
  );
}
