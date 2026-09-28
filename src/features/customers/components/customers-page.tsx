'use client';

import { useState } from 'react';
import { MoreHorizontal, Plus, Search, Trash2, Upload, Users } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { Link } from '@/core/i18n/navigation';
import { usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { useDebouncedValue } from '@/core/hooks/use-debounced-value';
import { useCustomersQuery } from '../hooks/use-customers-query';
import { useExportCustomersMutation } from '../hooks/use-export-customers-mutation';
import { useDeleteCustomerMutation } from '../hooks/use-delete-customer-mutation';
import { DeleteCustomerDialog } from './delete-customer-dialog';

const formatAmount = (value: number) => value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function CustomersPage() {
  const t = useTranslations('customers');
  const tCommon = useTranslations('common');
  const canCreate = usePermission(PERMISSIONS.CUSTOMERS_CREATE);
  const canEdit = usePermission(PERMISSIONS.CUSTOMERS_EDIT);
  const canDelete = usePermission(PERMISSIONS.CUSTOMERS_DELETE);
  const canExport = usePermission(PERMISSIONS.CUSTOMERS_EXPORT);
  const exportMutation = useExportCustomersMutation();

  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState('10');
  const [page, setPage] = useState(0);
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null);
  const deleteMutation = useDeleteCustomerMutation();

  const debouncedSearch = useDebouncedValue(search.trim());
  const query = { search: debouncedSearch, page: page + 1, pageSize: Number(pageSize) };
  const customersQuery = useCustomersQuery(query);

  const items = customersQuery.data?.items ?? [];
  const total = customersQuery.data?.total ?? 0;
  const size = Number(pageSize);
  const pageCount = Math.max(1, Math.ceil(total / size));

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(0);
    };
  }

  const columnCount = 6 + (canEdit || canDelete ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(event) => resetPage(setSearch)(event.target.value)}
            placeholder={tCommon('search')}
            className="ps-9"
          />
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <Button asChild>
              <Link href="/customers/new">
                <Plus className="size-4" />
                {tCommon('add')}
              </Link>
            </Button>
          )}
          {canExport && (
            <Button variant="outline" disabled={exportMutation.isPending} onClick={() => exportMutation.mutate(query)}>
              <Upload className="size-4" />
              {t('export')}
            </Button>
          )}
        </div>
      </div>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>{t('customerCode')}</TableHeaderCell>
            <TableHeaderCell>{t('customerName')}</TableHeaderCell>
            <TableHeaderCell>{t('customerEmail')}</TableHeaderCell>
            <TableHeaderCell>{t('phoneNumber')}</TableHeaderCell>
            <TableHeaderCell>{t('totalPaid')}</TableHeaderCell>
            <TableHeaderCell>{t('debitAmount')}</TableHeaderCell>
            {(canEdit || canDelete) && <TableHeaderCell className="w-16" />}
          </tr>
        </TableHead>
        <TableBody>
          {customersQuery.isPending ? (
            Array.from({ length: 4 }, (_, index) => (
              <TableRow key={index}>
                <TableCell colSpan={columnCount}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnCount} className="p-0">
                <EmptyState icon={Users} title={debouncedSearch ? tCommon('noResults') : t('empty')} />
              </TableCell>
            </TableRow>
          ) : (
            items.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  {canEdit ? (
                    <Link href={`/customers/${customer.id}/edit`} className="font-medium text-brand hover:underline">
                      {customer.code}
                    </Link>
                  ) : (
                    <span className="font-medium text-zinc-900">{customer.code}</span>
                  )}
                </TableCell>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email ?? ''}</TableCell>
                <TableCell dir="ltr" className="rtl:text-end">
                  {customer.phone}
                </TableCell>
                <TableCell>{formatAmount(customer.totalPaid)}</TableCell>
                <TableCell>{formatAmount(customer.debitAmount)}</TableCell>
                {(canEdit || canDelete) && (
                  <TableCell>
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
                          className="z-50 min-w-36 rounded-lg border border-zinc-200 bg-white p-1 shadow-md"
                        >
                          {canDelete && (
                            <DropdownMenu.Item
                              onSelect={() => setDeleting({ id: customer.id, name: customer.name })}
                              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 outline-none data-[highlighted]:bg-red-50"
                            >
                              <Trash2 className="size-4" />
                              {tCommon('delete')}
                            </DropdownMenu.Item>
                          )}
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </TableCell>
                )}
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
        summary={total > 0 ? t('showing', { from: page * size + 1, to: Math.min(total, (page + 1) * size), total }) : undefined}
      />

      <DeleteCustomerDialog
        customer={deleting}
        isPending={deleteMutation.isPending}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  );
}
