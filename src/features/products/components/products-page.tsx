'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  ArrowUpDown,
  Download,
  Eye,
  Filter,
  ImageIcon,
  ListChecks,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { Link, useRouter } from '@/core/i18n/navigation';
import { usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { useDebouncedValue } from '@/core/hooks/use-debounced-value';
import { useCategoriesQuery } from '@/features/categories/hooks/use-categories-query';
import { cn } from '@/lib/utils';
import { useProductsQuery } from '../hooks/use-products-query';
import { useExportProductsMutation } from '../hooks/use-export-products-mutation';
import { PRODUCT_SORTS, PRODUCT_TYPES, type ProductSort, type ProductType } from '../types/product';
import { DeleteProductDialog } from './delete-product-dialog';
import { ImportProductsDialog } from './import-products-dialog';
import { MAX_BULK_EDIT_SELECTION, saveBulkEditSelection } from '../utils/bulk-edit-selection';

const ALL = 'ALL';

const formatAmount = (value: number | null | undefined) =>
  value === null || value === undefined ? '—' : value.toLocaleString(undefined, { maximumFractionDigits: 3 });

/**
 * Rows are variants (a VARIABLE product contributes one per combination).
 * Columns follow what the backend returned: Available Quantity only with
 * `stock.access`, Cost only with `products.view_cost` — the backend omits
 * those fields otherwise, the UI just doesn't render an empty column.
 */
export function ProductsPage() {
  const t = useTranslations('products');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const canCreate = usePermission(PERMISSIONS.PRODUCTS_CREATE);
  const canEdit = usePermission(PERMISSIONS.PRODUCTS_EDIT);
  const canDelete = usePermission(PERMISSIONS.PRODUCTS_DELETE);
  const canViewCost = usePermission(PERMISSIONS.PRODUCTS_VIEW_COST);
  const canSeeStock = usePermission(PERMISSIONS.STOCK_ACCESS);
  const canExport = usePermission(PERMISSIONS.PRODUCTS_EXPORT);
  // Bulk edit reuses the same permission as a single edit — see the backend's
  // PATCH /products/bulk-pricing guard.
  const canBulkEdit = canEdit;

  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState<ProductType | typeof ALL>(ALL);
  const [categoryFilter, setCategoryFilter] = useState(ALL);
  const [sort, setSort] = useState<ProductSort>('CREATED_DESC');
  const [pageSize, setPageSize] = useState('10');
  const [page, setPage] = useState(0);
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  // variantId -> productId, so "Bulk Edit Products Info" can hand both off.
  const [selected, setSelected] = useState<Record<string, string>>({});

  const debouncedSearch = useDebouncedValue(search.trim());
  const listFilters = {
    search: debouncedSearch,
    type: typeFilter === ALL ? undefined : typeFilter,
    categoryId: categoryFilter === ALL ? undefined : categoryFilter,
    sort,
  };
  const productsQuery = useProductsQuery({ ...listFilters, page: page + 1, pageSize: Number(pageSize) });
  const categoriesQuery = useCategoriesQuery();
  const exportMutation = useExportProductsMutation();

  const items = productsQuery.data?.items ?? [];
  const total = productsQuery.data?.total ?? 0;
  const size = Number(pageSize);
  const pageCount = Math.max(1, Math.ceil(total / size));
  const categoryName = (id: string) => categoriesQuery.data?.find((category) => category.id === id)?.name;

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(0);
    };
  }

  function toggleSelected(variantId: string, productId: string) {
    setSelected((current) => {
      const next = { ...current };
      if (next[variantId]) {
        delete next[variantId];
      } else {
        if (Object.keys(next).length >= MAX_BULK_EDIT_SELECTION) {
          toast.error(t('form.bulkEditSelectionLimit', { max: MAX_BULK_EDIT_SELECTION }));
          return current;
        }
        next[variantId] = productId;
      }
      return next;
    });
  }

  const pageAllSelected = items.length > 0 && items.every((item) => selected[item.variantId]);
  function toggleSelectAllOnPage() {
    setSelected((current) => {
      if (pageAllSelected) {
        const next = { ...current };
        for (const item of items) delete next[item.variantId];
        return next;
      }
      const additions = items
        .filter((item) => !current[item.variantId])
        .slice(0, Math.max(0, MAX_BULK_EDIT_SELECTION - Object.keys(current).length));
      if (additions.length < items.filter((item) => !current[item.variantId]).length) {
        toast.error(t('form.bulkEditSelectionLimit', { max: MAX_BULK_EDIT_SELECTION }));
      }
      const next = { ...current };
      for (const item of additions) next[item.variantId] = item.productId;
      return next;
    });
  }

  function startBulkEdit() {
    saveBulkEditSelection(Object.entries(selected).map(([variantId, productId]) => ({ variantId, productId })));
    router.push('/products/bulk-edit');
  }

  const columnCount = 7 + (canSeeStock ? 1 : 0) + (canViewCost ? 1 : 0) + 1 + (canBulkEdit ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={search}
              onChange={(event) => resetPage(setSearch)(event.target.value)}
              placeholder={t('searchPlaceholder')}
              className="ps-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters((open) => !open)}
            className={cn(showFilters && 'border-brand text-brand')}
          >
            <Filter className="size-4" />
            {t('filters')}
          </Button>
          <Select value={sort} onValueChange={resetPage((value: string) => setSort(value as ProductSort))}>
            <SelectTrigger className="w-auto gap-2">
              <span className="flex items-center gap-1.5">
                <ArrowUpDown className="size-4 text-zinc-400" />
                <span className="text-zinc-500">{t('sortBy')}</span>
                <SelectValue>{t(`sorts.${sort}`)}</SelectValue>
              </span>
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_SORTS.map((option) => (
                <SelectItem key={option} value={option}>
                  {t(`sorts.${option}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          {(canCreate || canBulkEdit || canExport) && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  aria-label={t('moreActions')}
                  className="flex size-10 items-center justify-center rounded-lg border border-zinc-300 text-zinc-500 hover:bg-zinc-50"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={6}
                  className="z-50 w-72 rounded-lg border border-zinc-200 bg-white p-1 shadow-md"
                >
                  {canCreate && (
                    <>
                      <DropdownMenu.Label className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        {t('form.menuImport')}
                      </DropdownMenu.Label>
                      <DropdownMenu.Item
                        onSelect={() => setImportOpen(true)}
                        className="flex cursor-pointer items-start gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 outline-none data-[highlighted]:bg-zinc-100"
                      >
                        <Upload className="mt-0.5 size-4 shrink-0" />
                        <span>
                          <span className="block font-medium text-zinc-900">{t('form.importProducts')}</span>
                          <span className="block text-xs text-zinc-500">{t('form.importProductsHint')}</span>
                        </span>
                      </DropdownMenu.Item>
                    </>
                  )}
                  {canBulkEdit && (
                    <>
                      <DropdownMenu.Separator className="my-1 h-px bg-zinc-100" />
                      <DropdownMenu.Label className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        {t('form.menuUpdate')}
                      </DropdownMenu.Label>
                      <DropdownMenu.Item
                        disabled={Object.keys(selected).length === 0}
                        onSelect={startBulkEdit}
                        className="flex cursor-pointer items-start gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 outline-none data-[highlighted]:bg-zinc-100 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40"
                      >
                        <ListChecks className="mt-0.5 size-4 shrink-0" />
                        <span>
                          <span className="block font-medium text-zinc-900">{t('form.bulkEditProductsInfo')}</span>
                          <span className="block text-xs text-zinc-500">
                            {Object.keys(selected).length === 0
                              ? t('form.bulkEditSelectFirst')
                              : t('form.bulkEditSelectedCount', { count: Object.keys(selected).length })}
                          </span>
                        </span>
                      </DropdownMenu.Item>
                    </>
                  )}
                  {canExport && (
                    <>
                      <DropdownMenu.Separator className="my-1 h-px bg-zinc-100" />
                      <DropdownMenu.Label className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        {t('form.menuExport')}
                      </DropdownMenu.Label>
                      <DropdownMenu.Item
                        disabled={exportMutation.isPending}
                        onSelect={() => exportMutation.mutate(listFilters)}
                        className="flex cursor-pointer items-start gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 outline-none data-[highlighted]:bg-zinc-100"
                      >
                        <Download className="mt-0.5 size-4 shrink-0" />
                        <span className="font-medium text-zinc-900">{t('form.exportProductsList')}</span>
                      </DropdownMenu.Item>
                    </>
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}
          {canCreate && (
            <Button asChild>
              <Link href="/products/new">
                <Plus className="size-4" />
                {t('newProduct')}
              </Link>
            </Button>
          )}
        </div>
      </div>

      <ImportProductsDialog open={importOpen} onOpenChange={setImportOpen} />

      {showFilters && (
        <div className="flex flex-wrap gap-2 rounded-2xl border border-zinc-200 bg-white p-3">
          <Select
            value={typeFilter}
            onValueChange={resetPage((value: string) => setTypeFilter(value as ProductType | typeof ALL))}
          >
            <SelectTrigger className="w-52">
              <SelectValue>
                {t('productType')}: {typeFilter === ALL ? t('all') : t(`types.${typeFilter}`)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('all')}</SelectItem>
              {Object.values(PRODUCT_TYPES).map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`types.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={resetPage(setCategoryFilter)}>
            <SelectTrigger className="w-52">
              <SelectValue>
                {t('columns.category')}: {categoryFilter === ALL ? t('all') : categoryName(categoryFilter)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('all')}</SelectItem>
              {(categoriesQuery.data ?? []).map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Table>
        <TableHead>
          <tr>
            {canBulkEdit && (
              <TableHeaderCell className="w-10">
                <Checkbox
                  checked={pageAllSelected}
                  disabled={items.length === 0}
                  onCheckedChange={toggleSelectAllOnPage}
                  aria-label={t('form.selectAllOnPage')}
                />
              </TableHeaderCell>
            )}
            <TableHeaderCell>{t('columns.productName')}</TableHeaderCell>
            <TableHeaderCell>{t('columns.mainProduct')}</TableHeaderCell>
            <TableHeaderCell>{t('columns.category')}</TableHeaderCell>
            <TableHeaderCell>{t('columns.sku')}</TableHeaderCell>
            <TableHeaderCell>{t('columns.barcode')}</TableHeaderCell>
            {canSeeStock && <TableHeaderCell>{t('columns.availableQuantity')}</TableHeaderCell>}
            {canViewCost && <TableHeaderCell>{t('columns.cost')}</TableHeaderCell>}
            <TableHeaderCell>{t('columns.retailPrice')}</TableHeaderCell>
            <TableHeaderCell>{t('columns.wholesalePrice')}</TableHeaderCell>
            <TableHeaderCell>{t('columns.tax')}</TableHeaderCell>
            <TableHeaderCell className="w-28" />
          </tr>
        </TableHead>
        <TableBody>
          {productsQuery.isPending ? (
            Array.from({ length: 4 }, (_, index) => (
              <TableRow key={index}>
                <TableCell colSpan={columnCount}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnCount} className="p-0">
                <EmptyState
                  icon={Package}
                  title={debouncedSearch || typeFilter !== ALL || categoryFilter !== ALL ? tCommon('noResults') : t('empty')}
                />
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.variantId}>
                {canBulkEdit && (
                  <TableCell>
                    <Checkbox
                      checked={Boolean(selected[item.variantId])}
                      onCheckedChange={() => toggleSelected(item.variantId, item.productId)}
                      aria-label={t('form.selectRow')}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <Link href={`/products/${item.productId}`} className="flex items-center gap-3">
                    <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 text-zinc-300">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt="" fill className="object-cover" unoptimized />
                      ) : (
                        <ImageIcon className="size-5" />
                      )}
                    </span>
                    <span className="font-medium text-brand hover:underline">{item.name}</span>
                  </Link>
                </TableCell>
                <TableCell>{item.mainProductName}</TableCell>
                <TableCell>{item.categoryName ?? ''}</TableCell>
                <TableCell dir="ltr" className="rtl:text-end">
                  {item.sku}
                </TableCell>
                <TableCell dir="ltr" className="rtl:text-end">
                  {item.barcode ?? ''}
                </TableCell>
                {canSeeStock && (
                  <TableCell
                    className={cn(
                      item.quantity !== undefined &&
                        (item.quantity > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'),
                    )}
                  >
                    {item.quantity === undefined ? '—' : formatAmount(item.quantity)}
                  </TableCell>
                )}
                {canViewCost && <TableCell>{formatAmount(item.cost)}</TableCell>}
                <TableCell>{formatAmount(item.retailPrice)}</TableCell>
                <TableCell>{formatAmount(item.wholesalePrice)}</TableCell>
                <TableCell>{item.taxName ?? ''}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/products/${item.productId}`}
                      aria-label={t('view')}
                      className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                    >
                      <Eye className="size-4" />
                    </Link>
                    {canEdit && (
                      <Link
                        href={`/products/${item.productId}/edit`}
                        aria-label={tCommon('edit')}
                        className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                      >
                        <Pencil className="size-4" />
                      </Link>
                    )}
                    {canDelete && (
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button
                            type="button"
                            aria-label={t('moreActions')}
                            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                          >
                            <MoreHorizontal className="size-4" />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            align="end"
                            sideOffset={6}
                            className="z-50 min-w-40 rounded-lg border border-zinc-200 bg-white p-1 shadow-md"
                          >
                            <DropdownMenu.Item
                              onSelect={() => setDeleting({ id: item.productId, name: item.mainProductName })}
                              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 outline-none data-[highlighted]:bg-red-50"
                            >
                              <Trash2 className="size-4" />
                              {tCommon('delete')}
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={Math.min(page, pageCount - 1)}
        pageCount={pageCount}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={resetPage(setPageSize)}
        pageSizeLabel={t('noOfResults')}
        summary={
          total > 0
            ? t('showing', {
                from: page * size + 1,
                to: Math.min(total, (page + 1) * size),
                total,
              })
            : undefined
        }
      />

      <DeleteProductDialog product={deleting} onOpenChange={(open) => !open && setDeleting(null)} />
    </div>
  );
}
