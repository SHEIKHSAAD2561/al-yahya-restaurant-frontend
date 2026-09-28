'use client';

import { useState } from 'react';
import { ArrowRightLeft, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { Link } from '@/core/i18n/navigation';
import { usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { useLocationsQuery } from '@/features/locations/hooks/use-locations-query';
import { useStockTransfersQuery } from '../hooks/use-stock-transfers-query';
import { STOCK_TRANSFER_STATUSES, type StockTransferStatus } from '../types/stock-transfer';

const ALL = 'ALL';

const STATUS_VARIANT: Record<StockTransferStatus, 'success' | 'neutral' | 'danger'> = {
  PENDING: 'neutral',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'danger',
};

export function StockTransfersPage() {
  const t = useTranslations('stockTransfer');
  const tCommon = useTranslations('common');
  const canRequest = usePermission(PERMISSIONS.STOCK_REQUEST_TRANSFER);
  const locationsQuery = useLocationsQuery();

  const [fromLocationId, setFromLocationId] = useState(ALL);
  const [toLocationId, setToLocationId] = useState(ALL);
  const [status, setStatus] = useState<StockTransferStatus | typeof ALL>(ALL);
  const [pageSize, setPageSize] = useState('10');
  const [page, setPage] = useState(0);

  const query = {
    fromLocationId: fromLocationId === ALL ? undefined : fromLocationId,
    toLocationId: toLocationId === ALL ? undefined : toLocationId,
    status: status === ALL ? undefined : status,
    page: page + 1,
    pageSize: Number(pageSize),
  };
  const transfersQuery = useStockTransfersQuery(query);

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(0);
    };
  }

  const items = transfersQuery.data?.items ?? [];
  const total = transfersQuery.data?.total ?? 0;
  const size = Number(pageSize);
  const pageCount = Math.max(1, Math.ceil(total / size));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Select value={fromLocationId} onValueChange={resetPage(setFromLocationId)}>
            <SelectTrigger className="w-44">
              <SelectValue>
                {fromLocationId === ALL ? t('allFromLocations') : locationsQuery.data?.find((l) => l.id === fromLocationId)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('allFromLocations')}</SelectItem>
              {(locationsQuery.data ?? []).map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={toLocationId} onValueChange={resetPage(setToLocationId)}>
            <SelectTrigger className="w-44">
              <SelectValue>
                {toLocationId === ALL ? t('allToLocations') : locationsQuery.data?.find((l) => l.id === toLocationId)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('allToLocations')}</SelectItem>
              {(locationsQuery.data ?? []).map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(value) => resetPage(setStatus)(value as StockTransferStatus | typeof ALL)}>
            <SelectTrigger className="w-40">
              <SelectValue>{status === ALL ? t('allStatuses') : t(`statuses.${status}`)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('allStatuses')}</SelectItem>
              {Object.values(STOCK_TRANSFER_STATUSES).map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`statuses.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {canRequest && (
          <Button asChild>
            <Link href="/stock-transfer/new">
              <Plus className="size-4" />
              {t('newTransfer')}
            </Link>
          </Button>
        )}
      </div>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>{t('fromLocation')}</TableHeaderCell>
            <TableHeaderCell>{t('toLocation')}</TableHeaderCell>
            <TableHeaderCell>{t('requestedBy')}</TableHeaderCell>
            <TableHeaderCell>{t('status')}</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {transfersQuery.isPending ? (
            Array.from({ length: 4 }, (_, index) => (
              <TableRow key={index}>
                <TableCell colSpan={4}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="p-0">
                <EmptyState icon={ArrowRightLeft} title={tCommon('noResults')} />
              </TableCell>
            </TableRow>
          ) : (
            items.map((transfer) => (
              <TableRow key={transfer.id}>
                <TableCell>
                  <Link href={`/stock-transfer/${transfer.id}`} className="font-medium text-brand hover:underline">
                    {transfer.fromLocationName}
                  </Link>
                </TableCell>
                <TableCell>{transfer.toLocationName}</TableCell>
                <TableCell>{transfer.requestedByName}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[transfer.status]}>{t(`statuses.${transfer.status}`)}</Badge>
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
    </div>
  );
}
