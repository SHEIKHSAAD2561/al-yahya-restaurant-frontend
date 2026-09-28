'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QueryErrorState } from '@/components/ui/query-error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { Link, useRouter } from '@/core/i18n/navigation';
import { usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { useStockCountQuery } from '../hooks/use-stock-count-query';
import { useConfirmStockCountMutation, useUpdateStockCountLinesMutation } from '../hooks/use-stock-count-mutations';
import { STOCK_COUNT_STATUSES, type StockCount } from '../types/stock-count';

function StockCountDetailForm({ count }: { count: StockCount }) {
  const t = useTranslations('stockCount');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const canManage = usePermission(PERMISSIONS.STOCK_MANAGE_COUNTS);
  const updateLinesMutation = useUpdateStockCountLinesMutation(count.id);
  const confirmMutation = useConfirmStockCountMutation();

  const [countedById, setCountedById] = useState<Record<string, string>>(
    Object.fromEntries(count.lines.map((line) => [line.id, line.countedQuantity !== null ? String(line.countedQuantity) : ''])),
  );

  const isEditable = count.status === STOCK_COUNT_STATUSES.DRAFT;

  function handleSave() {
    const lines = count.lines
      .filter((line) => countedById[line.id]?.trim() !== '')
      .map((line) => ({ id: line.id, countedQuantity: Number(countedById[line.id]) }));
    if (lines.length === 0) return;
    updateLinesMutation.mutate(lines);
  }

  function handleConfirm() {
    confirmMutation.mutate(count.id, { onSuccess: () => router.push('/stock-count') });
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/stock-count" aria-label={t('back')} className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100">
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </Link>
        <h1 className="flex-1 text-lg font-semibold text-zinc-900">
          {count.location?.name} &middot; {count.countDate}
        </h1>
        <Badge variant={count.status === 'CONFIRMED' ? 'success' : 'neutral'}>{t(`statuses.${count.status}`)}</Badge>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>{t('product')}</TableHeaderCell>
              <TableHeaderCell>{t('expectedQuantity')}</TableHeaderCell>
              <TableHeaderCell>{t('countedQuantity')}</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {count.lines.map((line) => (
              <TableRow key={line.id}>
                <TableCell className="font-medium text-zinc-900">
                  {line.productName} <span className="text-zinc-400">({line.sku})</span>
                </TableCell>
                <TableCell>{line.expectedQuantity}</TableCell>
                <TableCell>
                  {isEditable && canManage ? (
                    <Input
                      type="number"
                      min="0"
                      step="0.001"
                      value={countedById[line.id] ?? ''}
                      onChange={(event) => setCountedById((current) => ({ ...current, [line.id]: event.target.value }))}
                      placeholder={t('notCountedYet')}
                      className="w-28"
                    />
                  ) : line.countedQuantity !== null ? (
                    line.countedQuantity
                  ) : (
                    <span className="text-zinc-400">{t('notCountedYet')}</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {isEditable && canManage && (
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => router.push('/stock-count')}>
            {tCommon('cancel')}
          </Button>
          <Button type="button" variant="outline" disabled={updateLinesMutation.isPending} onClick={handleSave}>
            {t('saveCounts')}
          </Button>
          <Button type="button" disabled={confirmMutation.isPending} onClick={handleConfirm}>
            {t('confirm')}
          </Button>
        </div>
      )}
    </div>
  );
}

export function StockCountDetailPage({ countId }: { countId: string }) {
  const countQuery = useStockCountQuery(countId);

  if (countQuery.isPending) return <Skeleton className="h-96 w-full" />;
  if (countQuery.isError || !countQuery.data) {
    return <QueryErrorState onRetry={() => void countQuery.refetch()} />;
  }

  return <StockCountDetailForm key={countQuery.data.updatedAt} count={countQuery.data} />;
}
