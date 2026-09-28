'use client';

import { useState } from 'react';
import { ClipboardList, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { Link, useRouter } from '@/core/i18n/navigation';
import { usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { useLocationsQuery } from '@/features/locations/hooks/use-locations-query';
import { useStockCountsQuery } from '../hooks/use-stock-counts-query';
import { useCreateStockCountMutation, useDeleteStockCountMutation } from '../hooks/use-stock-count-mutations';
import { STOCK_COUNT_STATUSES, type StockCountListItem, type StockCountStatus } from '../types/stock-count';

const ALL = 'ALL';

export function StockCountsPage() {
  const t = useTranslations('stockCount');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const canManage = usePermission(PERMISSIONS.STOCK_MANAGE_COUNTS);
  const locationsQuery = useLocationsQuery();

  const [locationId, setLocationId] = useState(ALL);
  const [status, setStatus] = useState<StockCountStatus | typeof ALL>(ALL);
  const [pageSize, setPageSize] = useState('10');
  const [page, setPage] = useState(0);
  const [deleting, setDeleting] = useState<StockCountListItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [newLocationId, setNewLocationId] = useState('');
  const [newCountDate, setNewCountDate] = useState(new Date().toISOString().slice(0, 10));

  const query = {
    locationId: locationId === ALL ? undefined : locationId,
    status: status === ALL ? undefined : status,
    page: page + 1,
    pageSize: Number(pageSize),
  };
  const countsQuery = useStockCountsQuery(query);
  const createMutation = useCreateStockCountMutation();
  const deleteMutation = useDeleteStockCountMutation();

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(0);
    };
  }

  const items = countsQuery.data?.items ?? [];
  const total = countsQuery.data?.total ?? 0;
  const size = Number(pageSize);
  const pageCount = Math.max(1, Math.ceil(total / size));

  function openCreateDialog() {
    setNewLocationId(locationsQuery.data?.find((l) => l.isDefault)?.id ?? locationsQuery.data?.[0]?.id ?? '');
    setNewCountDate(new Date().toISOString().slice(0, 10));
    setCreating(true);
  }

  function handleCreate() {
    createMutation.mutate(
      { locationId: newLocationId, countDate: newCountDate },
      {
        onSuccess: (count) => {
          setCreating(false);
          router.push(`/stock-count/${count.id}`);
        },
      },
    );
  }

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
          <Select value={status} onValueChange={(value) => resetPage(setStatus)(value as StockCountStatus | typeof ALL)}>
            <SelectTrigger className="w-40">
              <SelectValue>{status === ALL ? t('allStatuses') : t(`statuses.${status}`)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('allStatuses')}</SelectItem>
              {Object.values(STOCK_COUNT_STATUSES).map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`statuses.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {canManage && (
          <Button type="button" onClick={openCreateDialog}>
            <Plus className="size-4" />
            {t('newCount')}
          </Button>
        )}
      </div>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>{t('location')}</TableHeaderCell>
            <TableHeaderCell>{t('countDate')}</TableHeaderCell>
            <TableHeaderCell>{t('status')}</TableHeaderCell>
            <TableHeaderCell className="w-16" />
          </tr>
        </TableHead>
        <TableBody>
          {countsQuery.isPending ? (
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
                <EmptyState icon={ClipboardList} title={tCommon('noResults')} />
              </TableCell>
            </TableRow>
          ) : (
            items.map((count) => (
              <TableRow key={count.id}>
                <TableCell>
                  <Link href={`/stock-count/${count.id}`} className="font-medium text-brand hover:underline">
                    {count.locationName}
                  </Link>
                </TableCell>
                <TableCell>{count.countDate}</TableCell>
                <TableCell>
                  <Badge variant={count.status === 'CONFIRMED' ? 'success' : 'neutral'}>{t(`statuses.${count.status}`)}</Badge>
                </TableCell>
                <TableCell>
                  {canManage && count.status === 'DRAFT' && (
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
                            onSelect={() => setDeleting(count)}
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

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('newCount')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t('location')}</Label>
              <Select value={newLocationId} onValueChange={setNewLocationId}>
                <SelectTrigger>
                  <SelectValue>{locationsQuery.data?.find((l) => l.id === newLocationId)?.name}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(locationsQuery.data ?? []).map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newCountDate">{t('countDate')}</Label>
              <Input id="newCountDate" type="date" value={newCountDate} onChange={(event) => setNewCountDate(event.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setCreating(false)}>
              {tCommon('cancel')}
            </Button>
            <Button type="button" disabled={!newLocationId || createMutation.isPending} onClick={handleCreate}>
              {tCommon('create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
