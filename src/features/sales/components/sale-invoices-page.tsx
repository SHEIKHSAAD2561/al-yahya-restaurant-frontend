'use client';

import { useState } from 'react';
import { Eye, Printer, Receipt, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { Link } from '@/core/i18n/navigation';
import { useLocationsQuery } from '@/features/locations/hooks/use-locations-query';
import { usePaymentMethodsQuery } from '@/features/payment-methods/hooks/use-payment-methods-query';
import { AutoPrintReceipt } from '@/features/receipt-settings/components/auto-print-receipt';
import { useSalesQuery } from '../hooks/use-sales-query';
import { useExportSalesMutation } from '../hooks/use-export-sales-mutation';
import { SELL_AT } from '../types/sale';

const ALL = 'ALL';

/**
 * Standalone `/sale-invoices` — unlike the embedded `InvoiceListPage` inside
 * the Sell Screen (scoped to one register's location), this shows every sale
 * across every location, with its own Location filter. "Sale Type" (Retail vs
 * Wholesale) is the only sale-type distinction that exists in this schema —
 * there's no Channel or Delivery Partner concept yet (no e-commerce/delivery
 * integration built), so those two filters from the reference aren't offered
 * here rather than being faked.
 */
export function SaleInvoicesPage() {
  const t = useTranslations('sellScreen');
  const tCommon = useTranslations('common');
  const locationsQuery = useLocationsQuery();
  const paymentMethodsQuery = usePaymentMethodsQuery();
  const exportMutation = useExportSalesMutation();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState(ALL);
  const [locationId, setLocationId] = useState(ALL);
  const [sellAt, setSellAt] = useState(ALL);
  const [customerSearch, setCustomerSearch] = useState('');
  const [pageSize, setPageSize] = useState('10');
  const [page, setPage] = useState(0);
  const [printingSaleId, setPrintingSaleId] = useState<string | null>(null);

  const query = {
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    invoiceNumber: invoiceNumber || undefined,
    paymentMethodId: paymentMethodId === ALL ? undefined : paymentMethodId,
    locationId: locationId === ALL ? undefined : locationId,
    sellAt: sellAt === ALL ? undefined : (sellAt as (typeof SELL_AT)[keyof typeof SELL_AT]),
    customerSearch: customerSearch || undefined,
    page: page + 1,
    pageSize: Number(pageSize),
  };
  const salesQuery = useSalesQuery(query);

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(0);
    };
  }

  const items = salesQuery.data?.items ?? [];
  const total = salesQuery.data?.total ?? 0;
  const size = Number(pageSize);
  const pageCount = Math.max(1, Math.ceil(total / size));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid flex-1 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <Input type="date" value={dateFrom} onChange={(event) => resetPage(setDateFrom)(event.target.value)} />
          <Input type="date" value={dateTo} onChange={(event) => resetPage(setDateTo)(event.target.value)} />
          <Input
            value={invoiceNumber}
            onChange={(event) => resetPage(setInvoiceNumber)(event.target.value)}
            placeholder={t('invoiceNumber')}
          />
          <Select value={locationId} onValueChange={resetPage(setLocationId)}>
            <SelectTrigger>
              <SelectValue>
                {locationId === ALL ? t('allLocations') : locationsQuery.data?.find((l) => l.id === locationId)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('allLocations')}</SelectItem>
              {(locationsQuery.data ?? []).map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={paymentMethodId} onValueChange={resetPage(setPaymentMethodId)}>
            <SelectTrigger>
              <SelectValue>
                {paymentMethodId === ALL
                  ? t('paymentMethod')
                  : paymentMethodsQuery.data?.find((m) => m.id === paymentMethodId)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('allPaymentMethods')}</SelectItem>
              {(paymentMethodsQuery.data ?? []).map((method) => (
                <SelectItem key={method.id} value={method.id}>
                  {method.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sellAt} onValueChange={resetPage(setSellAt)}>
            <SelectTrigger>
              <SelectValue>{sellAt === ALL ? t('saleType') : t(sellAt === SELL_AT.RETAIL ? 'retail' : 'wholesale')}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('allSaleTypes')}</SelectItem>
              <SelectItem value={SELL_AT.RETAIL}>{t('retail')}</SelectItem>
              <SelectItem value={SELL_AT.WHOLESALE}>{t('wholesale')}</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={customerSearch}
            onChange={(event) => resetPage(setCustomerSearch)(event.target.value)}
            placeholder={t('customer')}
          />
        </div>
        <Button variant="outline" disabled={exportMutation.isPending} onClick={() => exportMutation.mutate(query)}>
          <Upload className="size-4" />
          {t('export')}
        </Button>
      </div>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>{t('invoiceNumber')}</TableHeaderCell>
            <TableHeaderCell>{t('date')}</TableHeaderCell>
            <TableHeaderCell>{t('location')}</TableHeaderCell>
            <TableHeaderCell>{t('saleType')}</TableHeaderCell>
            <TableHeaderCell>{t('paymentType')}</TableHeaderCell>
            <TableHeaderCell>{t('customer')}</TableHeaderCell>
            <TableHeaderCell>{t('amountPaid')}</TableHeaderCell>
            <TableHeaderCell className="w-20" />
          </tr>
        </TableHead>
        <TableBody>
          {salesQuery.isPending ? (
            Array.from({ length: 4 }, (_, index) => (
              <TableRow key={index}>
                <TableCell colSpan={8}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="p-0">
                <EmptyState icon={Receipt} title={tCommon('noResults')} />
              </TableCell>
            </TableRow>
          ) : (
            items.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-medium text-brand">
                  <Link href={`/sale-invoices/${sale.id}`} className="hover:underline">
                    {sale.invoiceNumber}
                  </Link>
                </TableCell>
                <TableCell>{new Date(sale.createdAt).toLocaleString()}</TableCell>
                <TableCell>{sale.locationName}</TableCell>
                <TableCell>{t(sale.sellAt === SELL_AT.RETAIL ? 'retail' : 'wholesale')}</TableCell>
                <TableCell>{sale.paymentMethodName || t('postPayment')}</TableCell>
                <TableCell>{sale.customerName ?? ''}</TableCell>
                <TableCell>{(sale.amountPaid ?? 0).toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/sale-invoices/${sale.id}`}
                      aria-label={t('view')}
                      className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                    >
                      <Eye className="size-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPrintingSaleId(sale.id)}
                      aria-label={t('printReceipt')}
                      className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                    >
                      <Printer className="size-4" />
                    </button>
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
        summary={total > 0 ? t('showingEntries', { from: page * size + 1, to: Math.min(total, (page + 1) * size), total }) : undefined}
      />

      {printingSaleId && <AutoPrintReceipt saleId={printingSaleId} onDone={() => setPrintingSaleId(null)} />}
    </div>
  );
}
