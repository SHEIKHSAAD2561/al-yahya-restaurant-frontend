'use client';

import { useState } from 'react';
import { FileText, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { Link } from '@/core/i18n/navigation';
import { usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { useSuppliersQuery } from '@/features/suppliers/hooks/use-suppliers-query';
import { useReturnInvoicesQuery } from '../hooks/use-return-invoices-query';
import {
  useConfirmReturnInvoiceMutation,
  useDeleteReturnInvoiceMutation,
} from '../hooks/use-save-return-invoice-mutation';
import { RETURN_INVOICE_STATUSES, type ReturnInvoiceListItem, type ReturnInvoiceStatus } from '../types/return-invoice';

const ALL = 'ALL';

function formatCurrency(value: number): string {
  return `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`;
}

export function ReturnInvoicesPage() {
  const t = useTranslations('returnInvoices');
  const tCommon = useTranslations('common');
  const canManage = usePermission(PERMISSIONS.PURCHASES_SUPPLIERS_RECORD_RETURNS);
  const suppliersQuery = useSuppliersQuery();

  const [supplierId, setSupplierId] = useState(ALL);
  const [status, setStatus] = useState<ReturnInvoiceStatus | typeof ALL>(ALL);
  const [pageSize, setPageSize] = useState('10');
  const [page, setPage] = useState(0);
  const [deleting, setDeleting] = useState<ReturnInvoiceListItem | null>(null);

  const query = {
    supplierId: supplierId === ALL ? undefined : supplierId,
    status: status === ALL ? undefined : status,
    page: page + 1,
    pageSize: Number(pageSize),
  };
  const invoicesQuery = useReturnInvoicesQuery(query);
  const confirmMutation = useConfirmReturnInvoiceMutation();
  const deleteMutation = useDeleteReturnInvoiceMutation();

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(0);
    };
  }

  const items = invoicesQuery.data?.items ?? [];
  const total = invoicesQuery.data?.total ?? 0;
  const size = Number(pageSize);
  const pageCount = Math.max(1, Math.ceil(total / size));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Select value={supplierId} onValueChange={resetPage(setSupplierId)}>
            <SelectTrigger className="w-48">
              <SelectValue>
                {supplierId === ALL ? t('allSuppliers') : suppliersQuery.data?.find((s) => s.id === supplierId)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('allSuppliers')}</SelectItem>
              {(suppliersQuery.data ?? []).map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(value) => resetPage(setStatus)(value as ReturnInvoiceStatus | typeof ALL)}>
            <SelectTrigger className="w-40">
              <SelectValue>{status === ALL ? t('allStatuses') : t(`statuses.${status}`)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('allStatuses')}</SelectItem>
              {Object.values(RETURN_INVOICE_STATUSES).map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`statuses.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {canManage && (
          <Button asChild>
            <Link href="/return-invoices/new">
              <Plus className="size-4" />
              {t('newReturnInvoice')}
            </Link>
          </Button>
        )}
      </div>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>{t('returnNumber')}</TableHeaderCell>
            <TableHeaderCell>{t('supplier')}</TableHeaderCell>
            <TableHeaderCell>{t('location')}</TableHeaderCell>
            <TableHeaderCell>{t('returnDate')}</TableHeaderCell>
            <TableHeaderCell>{t('total')}</TableHeaderCell>
            <TableHeaderCell>{t('status')}</TableHeaderCell>
            <TableHeaderCell className="w-16" />
          </tr>
        </TableHead>
        <TableBody>
          {invoicesQuery.isPending ? (
            Array.from({ length: 4 }, (_, index) => (
              <TableRow key={index}>
                <TableCell colSpan={7}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="p-0">
                <EmptyState icon={FileText} title={tCommon('noResults')} />
              </TableCell>
            </TableRow>
          ) : (
            items.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  <Link href={`/return-invoices/${invoice.id}/edit`} className="font-medium text-brand hover:underline">
                    {invoice.returnNumber ?? t('draft')}
                  </Link>
                </TableCell>
                <TableCell>{invoice.supplierName}</TableCell>
                <TableCell>{invoice.locationName}</TableCell>
                <TableCell>{invoice.returnDate}</TableCell>
                <TableCell>{formatCurrency(invoice.total)}</TableCell>
                <TableCell>
                  <Badge variant={invoice.status === 'CONFIRMED' ? 'success' : 'neutral'}>
                    {t(`statuses.${invoice.status}`)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {canManage && invoice.status === 'DRAFT' && (
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button
                          type="button"
                          aria-label={tCommon('edit')}
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
                          <DropdownMenu.Item
                            onSelect={() => confirmMutation.mutate(invoice.id)}
                            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-zinc-50"
                          >
                            {t('confirm')}
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            onSelect={() => setDeleting(invoice)}
                            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 outline-none data-[highlighted]:bg-red-50"
                          >
                            <Trash2 className="size-4" />
                            {tCommon('delete')}
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  )}
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
        summary={total > 0 ? t('showing', { from: page * size + 1, to: Math.min(total, (page + 1) * size), total }) : undefined}
      />

      <Dialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteConfirmTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-600">{t('deleteConfirmDescription')}</p>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDeleting(null)}>
              {tCommon('cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleting && deleteMutation.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
            >
              {tCommon('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
