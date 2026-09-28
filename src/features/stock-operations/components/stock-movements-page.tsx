'use client';

import { useState } from 'react';
import { MoreHorizontal, PackageSearch, Plus, Trash2 } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { Link } from '@/core/i18n/navigation';
import { useAnyPermission, usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { useLocationsQuery } from '@/features/locations/hooks/use-locations-query';
import { useStockMovementsQuery } from '../hooks/use-stock-movements-query';
import { useConfirmStockMovementMutation, useDeleteStockMovementMutation } from '../hooks/use-save-stock-movement-mutation';
import { STOCK_MOVEMENT_STATUSES, STOCK_MOVEMENT_TYPES, type StockMovementListItem, type StockMovementStatus, type StockMovementType } from '../types/stock-movement';

const ALL = 'ALL';

export function StockMovementsPage() {
  const t = useTranslations('stockOperations');
  const tCommon = useTranslations('common');
  const canWrite = useAnyPermission([PERMISSIONS.STOCK_RECORD_DRAFT, PERMISSIONS.STOCK_MANAGE_MOVEMENTS]);
  const canConfirm = usePermission(PERMISSIONS.STOCK_MANAGE_MOVEMENTS);
  const locationsQuery = useLocationsQuery();

  const [locationId, setLocationId] = useState(ALL);
  const [type, setType] = useState<StockMovementType | typeof ALL>(ALL);
  const [status, setStatus] = useState<StockMovementStatus | typeof ALL>(ALL);
  const [pageSize, setPageSize] = useState('10');
  const [page, setPage] = useState(0);
  const [deleting, setDeleting] = useState<StockMovementListItem | null>(null);

  const query = {
    locationId: locationId === ALL ? undefined : locationId,
    type: type === ALL ? undefined : type,
    status: status === ALL ? undefined : status,
    page: page + 1,
    pageSize: Number(pageSize),
  };
  const movementsQuery = useStockMovementsQuery(query);
  const confirmMutation = useConfirmStockMovementMutation();
  const deleteMutation = useDeleteStockMovementMutation();

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(0);
    };
  }

  const items = movementsQuery.data?.items ?? [];
  const total = movementsQuery.data?.total ?? 0;
  const size = Number(pageSize);
  const pageCount = Math.max(1, Math.ceil(total / size));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Select value={locationId} onValueChange={resetPage(setLocationId)}>
            <SelectTrigger className="w-48">
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
          <Select value={type} onValueChange={(value) => resetPage(setType)(value as StockMovementType | typeof ALL)}>
            <SelectTrigger className="w-36">
              <SelectValue>{type === ALL ? t('allTypes') : t(`types.${type}`)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('allTypes')}</SelectItem>
              {Object.values(STOCK_MOVEMENT_TYPES).map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`types.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(value) => resetPage(setStatus)(value as StockMovementStatus | typeof ALL)}>
            <SelectTrigger className="w-40">
              <SelectValue>{status === ALL ? t('allStatuses') : t(`statuses.${status}`)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('allStatuses')}</SelectItem>
              {Object.values(STOCK_MOVEMENT_STATUSES).map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`statuses.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {canWrite && (
          <Button asChild>
            <Link href="/stock-operations/new">
              <Plus className="size-4" />
              {t('newMovement')}
            </Link>
          </Button>
        )}
      </div>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>{t('type')}</TableHeaderCell>
            <TableHeaderCell>{t('reason')}</TableHeaderCell>
            <TableHeaderCell>{t('location')}</TableHeaderCell>
            <TableHeaderCell>{t('movementDate')}</TableHeaderCell>
            <TableHeaderCell>{t('status')}</TableHeaderCell>
            <TableHeaderCell className="w-16" />
          </tr>
        </TableHead>
        <TableBody>
          {movementsQuery.isPending ? (
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
                <EmptyState icon={PackageSearch} title={tCommon('noResults')} />
              </TableCell>
            </TableRow>
          ) : (
            items.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell>
                  <Link href={`/stock-operations/${movement.id}/edit`} className="font-medium text-brand hover:underline">
                    {t(`types.${movement.type}`)}
                  </Link>
                </TableCell>
                <TableCell>{movement.reason}</TableCell>
                <TableCell>{movement.locationName}</TableCell>
                <TableCell>{movement.movementDate}</TableCell>
                <TableCell>
                  <Badge variant={movement.status === 'CONFIRMED' ? 'success' : 'neutral'}>
                    {t(`statuses.${movement.status}`)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {movement.status === 'DRAFT' && (canWrite || canConfirm) && (
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
                          {canConfirm && (
                            <DropdownMenu.Item
                              onSelect={() => confirmMutation.mutate(movement.id)}
                              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-zinc-50"
                            >
                              {t('confirm')}
                            </DropdownMenu.Item>
                          )}
                          {canWrite && (
                            <DropdownMenu.Item
                              onSelect={() => setDeleting(movement)}
                              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 outline-none data-[highlighted]:bg-red-50"
                            >
                              <Trash2 className="size-4" />
                              {tCommon('delete')}
                            </DropdownMenu.Item>
                          )}
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
