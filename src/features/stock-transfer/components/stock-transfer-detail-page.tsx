'use client';

import { ArrowLeft } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QueryErrorState } from '@/components/ui/query-error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { Link, useRouter } from '@/core/i18n/navigation';
import { usePermission, useSession } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { useStockTransferQuery } from '../hooks/use-stock-transfer-query';
import {
  useApproveStockTransferMutation,
  useCancelStockTransferMutation,
  useRejectStockTransferMutation,
} from '../hooks/use-stock-transfer-mutations';
import { STOCK_TRANSFER_STATUSES, type StockTransferStatus } from '../types/stock-transfer';

const STATUS_VARIANT: Record<StockTransferStatus, 'success' | 'neutral' | 'danger'> = {
  PENDING: 'neutral',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'danger',
};

export function StockTransferDetailPage({ transferId }: { transferId: string }) {
  const t = useTranslations('stockTransfer');
  const locale = useLocale();
  const router = useRouter();
  const session = useSession();
  const canApprove = usePermission(PERMISSIONS.STOCK_APPROVE_TRANSFER);
  const canRequest = usePermission(PERMISSIONS.STOCK_REQUEST_TRANSFER);
  const transferQuery = useStockTransferQuery(transferId);
  const approveMutation = useApproveStockTransferMutation();
  const rejectMutation = useRejectStockTransferMutation();
  const cancelMutation = useCancelStockTransferMutation();

  if (transferQuery.isPending) return <Skeleton className="h-96 w-full" />;
  if (transferQuery.isError || !transferQuery.data) {
    return <QueryErrorState onRetry={() => void transferQuery.refetch()} />;
  }

  const transfer = transferQuery.data;
  const isPending = transfer.status === STOCK_TRANSFER_STATUSES.PENDING;
  const isRequester = transfer.requestedByUserId === session.id;
  const isBusy = approveMutation.isPending || rejectMutation.isPending || cancelMutation.isPending;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/stock-transfer" aria-label={t('back')} className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100">
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </Link>
        <h1 className="flex-1 text-lg font-semibold text-zinc-900">
          {transfer.fromLocation?.name} &rarr; {transfer.toLocation?.name}
        </h1>
        <Badge variant={STATUS_VARIANT[transfer.status]}>{t(`statuses.${transfer.status}`)}</Badge>
      </div>

      <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6 sm:grid-cols-2">
        <div>
          <div className="text-xs font-medium text-zinc-500">{t('fromLocation')}</div>
          <div className="text-sm text-zinc-900">{transfer.fromLocation?.name}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-zinc-500">{t('toLocation')}</div>
          <div className="text-sm text-zinc-900">{transfer.toLocation?.name}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-zinc-500">{t('requestedBy')}</div>
          <div className="text-sm text-zinc-900">
            {locale === 'ar' ? transfer.requestedBy?.nameAr : transfer.requestedBy?.nameEn}
          </div>
        </div>
        {transfer.notes && (
          <div className="sm:col-span-2">
            <div className="text-xs font-medium text-zinc-500">{t('notes')}</div>
            <div className="text-sm text-zinc-900">{transfer.notes}</div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">{t('lineItems')}</h2>
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>{t('product')}</TableHeaderCell>
              <TableHeaderCell>{t('quantity')}</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {transfer.lines.map((line) => (
              <TableRow key={line.id}>
                <TableCell className="font-medium text-zinc-900">
                  {line.productName} <span className="text-zinc-400">({line.sku})</span>
                </TableCell>
                <TableCell>{line.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {isPending && (canApprove || (canRequest && isRequester)) && (
        <div className="flex justify-end gap-2">
          {canRequest && isRequester && (
            <Button
              type="button"
              variant="ghost"
              disabled={isBusy}
              onClick={() => cancelMutation.mutate(transfer.id, { onSuccess: () => router.push('/stock-transfer') })}
            >
              {t('cancelRequest')}
            </Button>
          )}
          {canApprove && (
            <>
              <Button
                type="button"
                variant="destructive"
                disabled={isBusy}
                onClick={() => rejectMutation.mutate(transfer.id, { onSuccess: () => router.push('/stock-transfer') })}
              >
                {t('reject')}
              </Button>
              <Button
                type="button"
                disabled={isBusy}
                onClick={() => approveMutation.mutate(transfer.id, { onSuccess: () => router.push('/stock-transfer') })}
              >
                {t('approve')}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
