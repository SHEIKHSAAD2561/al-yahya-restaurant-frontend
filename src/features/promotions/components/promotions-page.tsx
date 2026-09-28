'use client';

import { useState } from 'react';
import { MoreHorizontal, Plus, Tag, Trash2 } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { Link } from '@/core/i18n/navigation';
import { usePromotionsQuery } from '../hooks/use-promotions-query';
import { useUpdatePromotionStatusMutation } from '../hooks/use-update-promotion-status-mutation';
import { useDeletePromotionMutation } from '../hooks/use-delete-promotion-mutation';
import { PROMOTION_STATUSES, type PromotionStatus } from '../types/promotion';

const ALL = 'ALL';

function StatusBadge({ status }: { status: PromotionStatus }) {
  const t = useTranslations('promotions');
  if (status === 'ACTIVE') return <Badge variant="success">{t('statuses.ACTIVE')}</Badge>;
  if (status === 'SCHEDULED') return <Badge variant="brand">{t('statuses.SCHEDULED')}</Badge>;
  if (status === 'EXPIRED') return <Badge variant="neutral">{t('statuses.EXPIRED')}</Badge>;
  return <Badge variant="warning">{t('statuses.INACTIVE')}</Badge>;
}

export function PromotionsPage() {
  const t = useTranslations('promotions');
  const tCommon = useTranslations('common');
  const [status, setStatus] = useState<PromotionStatus | typeof ALL>(ALL);
  const [pageSize, setPageSize] = useState('10');
  const [page, setPage] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const query = { status: status === ALL ? undefined : status, page: page + 1, pageSize: Number(pageSize) };
  const promotionsQuery = usePromotionsQuery(query);
  const statusMutation = useUpdatePromotionStatusMutation();
  const deleteMutation = useDeletePromotionMutation();

  const items = promotionsQuery.data?.items ?? [];
  const total = promotionsQuery.data?.total ?? 0;
  const size = Number(pageSize);
  const pageCount = Math.max(1, Math.ceil(total / size));

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(0);
    };
  }

  if (promotionsQuery.isPending) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (total === 0 && status === ALL) {
    return (
      <EmptyState
        icon={Tag}
        title={t('emptyTitle')}
        description={t('emptyDescription')}
        action={
          <Button asChild>
            <Link href="/promotions/new">
              <Plus className="size-4" />
              {t('createPromotion')}
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={status} onValueChange={(value) => resetPage(setStatus)(value as PromotionStatus | typeof ALL)}>
          <SelectTrigger className="w-44">
            <SelectValue>{status === ALL ? t('allStatuses') : t(`statuses.${status}`)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t('allStatuses')}</SelectItem>
            {PROMOTION_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {t(`statuses.${value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button asChild>
          <Link href="/promotions/new">
            <Plus className="size-4" />
            {t('createPromotion')}
          </Link>
        </Button>
      </div>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>{t('promotionName')}</TableHeaderCell>
            <TableHeaderCell>{t('type')}</TableHeaderCell>
            <TableHeaderCell>{t('startDate')}</TableHeaderCell>
            <TableHeaderCell>{t('endDate')}</TableHeaderCell>
            <TableHeaderCell>{t('status')}</TableHeaderCell>
            <TableHeaderCell className="w-16" />
          </tr>
        </TableHead>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="p-0">
                <EmptyState icon={Tag} title={tCommon('noResults')} />
              </TableCell>
            </TableRow>
          ) : (
            items.map((promotion) => (
              <TableRow key={promotion.id}>
                <TableCell>
                  <Link href={`/promotions/${promotion.id}/edit`} className="font-medium text-brand hover:underline">
                    {promotion.name}
                  </Link>
                </TableCell>
                <TableCell>{t(`types.${promotion.type}`)}</TableCell>
                <TableCell>{new Date(promotion.startAt).toLocaleString()}</TableCell>
                <TableCell>{promotion.endAt ? new Date(promotion.endAt).toLocaleString() : t('noEndDate')}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={promotion.status} />
                    {promotion.status !== 'EXPIRED' && (
                      <Switch
                        checked={promotion.status !== 'INACTIVE'}
                        disabled={statusMutation.isPending}
                        onCheckedChange={(checked) => statusMutation.mutate({ id: promotion.id, isActive: checked })}
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell>
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
                          onSelect={() => setDeletingId(promotion.id)}
                          className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 outline-none data-[highlighted]:bg-red-50"
                        >
                          <Trash2 className="size-4" />
                          {tCommon('delete')}
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
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

      <Dialog open={deletingId !== null} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteConfirmTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-600">{t('deleteConfirmDescription')}</p>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDeletingId(null)}>
              {tCommon('cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deletingId && deleteMutation.mutate(deletingId, { onSuccess: () => setDeletingId(null) })}
            >
              {tCommon('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
