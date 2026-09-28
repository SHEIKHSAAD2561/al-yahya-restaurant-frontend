'use client';

import { useState } from 'react';
import { CreditCard, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { useReceivablesSummaryQuery } from '@/features/customers/hooks/use-receivables-summary-query';
import { useCustomerPaymentsQuery } from '../hooks/use-customer-payments-query';
import { useDeleteCustomerPaymentMutation } from '../hooks/use-customer-payment-mutations';
import { CustomerPaymentDialog } from './customer-payment-dialog';
import { CustomerFilterSearch } from './customer-filter-search';

function formatCurrency(value: number): string {
  return `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`;
}

export function CustomerPaymentsPage() {
  const t = useTranslations('customerPayments');
  const tCommon = useTranslations('common');
  const canView = usePermission(PERMISSIONS.CUSTOMERS_VIEW_BALANCES);
  const canManage = usePermission(PERMISSIONS.CUSTOMERS_MANAGE_SETTLEMENTS);
  const summaryQuery = useReceivablesSummaryQuery();

  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [pageSize, setPageSize] = useState('10');
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const query = { customerId: customerId || undefined, page: page + 1, pageSize: Number(pageSize) };
  const paymentsQuery = useCustomerPaymentsQuery(query);
  const deleteMutation = useDeleteCustomerPaymentMutation();

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(0);
    };
  }

  const items = paymentsQuery.data?.items ?? [];
  const total = paymentsQuery.data?.total ?? 0;
  const size = Number(pageSize);
  const pageCount = Math.max(1, Math.ceil(total / size));

  return (
    <div className="space-y-4">
      {canView && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-sm text-zinc-500">{t('totalOutstanding')}</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900">
            {formatCurrency(Math.max(0, summaryQuery.data?.totalOutstanding ?? 0))}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <CustomerFilterSearch
          customerId={customerId}
          customerName={customerName}
          onChange={(id, name) => {
            resetPage(setCustomerId)(id);
            setCustomerName(name);
          }}
        />
        {canManage && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            {t('recordPayment')}
          </Button>
        )}
      </div>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>{t('date')}</TableHeaderCell>
            <TableHeaderCell>{t('customer')}</TableHeaderCell>
            <TableHeaderCell>{t('amount')}</TableHeaderCell>
            <TableHeaderCell>{t('paymentMethod')}</TableHeaderCell>
            <TableHeaderCell>{t('notes')}</TableHeaderCell>
            {canManage && <TableHeaderCell className="w-16" />}
          </tr>
        </TableHead>
        <TableBody>
          {paymentsQuery.isPending ? (
            Array.from({ length: 4 }, (_, index) => (
              <TableRow key={index}>
                <TableCell colSpan={6}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="p-0">
                <EmptyState icon={CreditCard} title={tCommon('noResults')} />
              </TableCell>
            </TableRow>
          ) : (
            items.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.paymentDate}</TableCell>
                <TableCell className="font-medium text-zinc-900">{payment.customerName}</TableCell>
                <TableCell>{formatCurrency(payment.amount)}</TableCell>
                <TableCell>{payment.paymentMethodName ?? ''}</TableCell>
                <TableCell>{payment.notes ?? ''}</TableCell>
                {canManage && (
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(payment.id)}
                      aria-label={tCommon('delete')}
                      className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
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

      <CustomerPaymentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
