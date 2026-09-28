'use client';

import { useState } from 'react';
import { Eye, Receipt } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { useSalesQuery } from '@/features/sales/hooks/use-sales-query';
import { SaleDetailDialog } from '@/features/sales/components/sale-detail-dialog';

export function SessionInvoicesDialog({
  sessionId,
  onOpenChange,
}: {
  sessionId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations('cashManagement');
  const tCommon = useTranslations('common');
  const [viewingSaleId, setViewingSaleId] = useState<string | null>(null);
  const salesQuery = useSalesQuery({ registerSessionId: sessionId ?? undefined, pageSize: 100 });
  const items = salesQuery.data?.items ?? [];

  return (
    <>
      <Dialog open={sessionId !== null} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('sessionInvoices')}</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>{t('invoiceNumber')}</TableHeaderCell>
                <TableHeaderCell>{t('date')}</TableHeaderCell>
                <TableHeaderCell>{t('total')}</TableHeaderCell>
                <TableHeaderCell className="w-16" />
              </tr>
            </TableHead>
            <TableBody>
              {salesQuery.isPending ? (
                Array.from({ length: 3 }, (_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={4}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="p-0">
                    <EmptyState icon={Receipt} title={tCommon('noResults')} />
                  </TableCell>
                </TableRow>
              ) : (
                items.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium text-zinc-900">{sale.invoiceNumber}</TableCell>
                    <TableCell>{new Date(sale.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{sale.total.toFixed(2)}</TableCell>
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
        </DialogContent>
      </Dialog>
      <SaleDetailDialog saleId={viewingSaleId} onOpenChange={(open) => !open && setViewingSaleId(null)} />
    </>
  );
}
