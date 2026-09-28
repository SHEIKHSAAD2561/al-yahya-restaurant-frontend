'use client';

import { useState } from 'react';
import { Eye, Receipt } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { useLocationsQuery } from '@/features/locations/hooks/use-locations-query';
import { usePaymentMethodsQuery } from '@/features/payment-methods/hooks/use-payment-methods-query';
import { useSalesQuery } from '../hooks/use-sales-query';
import { SaleDetailDialog } from './sale-detail-dialog';

const ALL = 'ALL';

export function InvoiceListPage({ locationId }: { locationId: string }) {
  const t = useTranslations('sellScreen');
  const tCommon = useTranslations('common');
  const locationsQuery = useLocationsQuery();
  const paymentMethodsQuery = usePaymentMethodsQuery();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState(ALL);
  const [locationFilter, setLocationFilter] = useState(locationId);
  const [customerSearch, setCustomerSearch] = useState('');
  const [productName, setProductName] = useState('');
  const [productSku, setProductSku] = useState('');
  const [pageSize, setPageSize] = useState('10');
  const [page, setPage] = useState(0);
  const [viewingSaleId, setViewingSaleId] = useState<string | null>(null);

  const query = {
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    invoiceNumber: invoiceNumber || undefined,
    paymentMethodId: paymentMethodId === ALL ? undefined : paymentMethodId,
    locationId: locationFilter === ALL ? undefined : locationFilter,
    customerSearch: customerSearch || undefined,
    productName: productName || undefined,
    productSku: productSku || undefined,
    page: page + 1,
    pageSize: Number(pageSize),
  };
  const salesQuery = useSalesQuery(query);

  function resetFilters() {
    setDateFrom('');
    setDateTo('');
    setInvoiceNumber('');
    setPaymentMethodId(ALL);
    setLocationFilter(ALL);
    setCustomerSearch('');
    setProductName('');
    setProductSku('');
    setPage(0);
  }

  const items = salesQuery.data?.items ?? [];
  const total = salesQuery.data?.total ?? 0;
  const size = Number(pageSize);
  const pageCount = Math.max(1, Math.ceil(total / size));

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
        <Input type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(0); }} />
        <Input type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(0); }} />
        <Input
          value={invoiceNumber}
          onChange={(event) => { setInvoiceNumber(event.target.value); setPage(0); }}
          placeholder={t('invoiceNumber')}
        />
        <Select value={paymentMethodId} onValueChange={(value) => { setPaymentMethodId(value); setPage(0); }}>
          <SelectTrigger>
            <SelectValue>
              {paymentMethodId === ALL ? t('paymentMethod') : paymentMethodsQuery.data?.find((m) => m.id === paymentMethodId)?.name}
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
        <Select value={locationFilter} onValueChange={(value) => { setLocationFilter(value); setPage(0); }}>
          <SelectTrigger>
            <SelectValue>
              {locationFilter === ALL ? t('location') : locationsQuery.data?.find((l) => l.id === locationFilter)?.name}
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
        <Input
          value={customerSearch}
          onChange={(event) => { setCustomerSearch(event.target.value); setPage(0); }}
          placeholder={t('customer')}
        />
        <Input
          value={productName}
          onChange={(event) => { setProductName(event.target.value); setPage(0); }}
          placeholder={t('productName')}
        />
        <Input
          value={productSku}
          onChange={(event) => { setProductSku(event.target.value); setPage(0); }}
          placeholder={t('productSku')}
        />
        <Button variant="ghost" onClick={resetFilters}>
          {t('reset')}
        </Button>
      </div>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>{t('invoiceNumber')}</TableHeaderCell>
            <TableHeaderCell>{t('date')}</TableHeaderCell>
            <TableHeaderCell>{t('paymentType')}</TableHeaderCell>
            <TableHeaderCell>{t('price')}</TableHeaderCell>
            <TableHeaderCell>{t('amountPaid')}</TableHeaderCell>
            <TableHeaderCell>{t('type')}</TableHeaderCell>
            <TableHeaderCell className="w-16" />
          </tr>
        </TableHead>
        <TableBody>
          {salesQuery.isPending ? (
            Array.from({ length: 3 }, (_, index) => (
              <TableRow key={index}>
                <TableCell colSpan={7}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="p-0">
                <EmptyState icon={Receipt} title={tCommon('noResults')} />
              </TableCell>
            </TableRow>
          ) : (
            items.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-medium text-zinc-900">{sale.invoiceNumber}</TableCell>
                <TableCell>{new Date(sale.createdAt).toLocaleString()}</TableCell>
                <TableCell>{sale.paymentMethodName || t('postPayment')}</TableCell>
                <TableCell>{sale.total.toFixed(2)}</TableCell>
                <TableCell>{(sale.amountPaid ?? 0).toFixed(2)}</TableCell>
                <TableCell>{t('sale')}</TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => setViewingSaleId(sale.id)}
                    aria-label={t('view')}
                    className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                  >
                    <Eye className="size-4" />
                  </button>
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
        onPageSizeChange={(value) => { setPageSize(value); setPage(0); }}
        pageSizeLabel={t('noOfResults')}
        summary={total > 0 ? t('showingEntries', { from: page * size + 1, to: Math.min(total, (page + 1) * size), total }) : undefined}
      />

      <SaleDetailDialog saleId={viewingSaleId} onOpenChange={(open) => !open && setViewingSaleId(null)} />
    </div>
  );
}
