'use client';

import { useState } from 'react';
import { Printer, Receipt } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QueryErrorState } from '@/components/ui/query-error-state';
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useSessionDetailQuery } from '../hooks/use-session-detail-query';
import { useSessionMovementsQuery } from '../hooks/use-session-movements-query';
import type { SessionStatus } from '../types/session';
import { SessionInvoicesDialog } from './session-invoices-dialog';

const TABS = ['paymentMethods', 'registerSummary', 'addWithdraw'] as const;
type Tab = (typeof TABS)[number];

function StatusBadge({ status }: { status: SessionStatus }) {
  const t = useTranslations('cashManagement');
  if (status === 'OPEN') return <Badge variant="brand">{t('statusOpen')}</Badge>;
  if (status === 'BALANCED') return <Badge variant="success">{t('statusBalanced')}</Badge>;
  return <Badge variant="danger">{t('statusUnbalanced')}</Badge>;
}

export function SessionDetailSheet({
  sessionId,
  onOpenChange,
}: {
  sessionId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations('cashManagement');
  const tRegisters = useTranslations('registers');
  const [tab, setTab] = useState<Tab>('paymentMethods');
  const [showInvoices, setShowInvoices] = useState(false);
  const detailQuery = useSessionDetailQuery(sessionId);
  const movementsQuery = useSessionMovementsQuery(tab === 'addWithdraw' ? sessionId : null);
  const detail = detailQuery.data;

  return (
    <>
      <Sheet
        open={sessionId !== null}
        onOpenChange={(open) => {
          if (!open) setTab('paymentMethods');
          onOpenChange(open);
        }}
      >
        <SheetContent className="max-w-xl">
          <SheetHeader>
            <SheetTitle>{detail?.registerName ?? t('sessionDetails')}</SheetTitle>
            {detail && (
              <p className="text-sm text-zinc-500">
                {detail.locationName} · {new Date(detail.openedAt).toLocaleString()}
              </p>
            )}
          </SheetHeader>

          <div className="border-b border-zinc-200 px-6">
            <nav className="-mb-px flex gap-6">
              {TABS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value)}
                  className={cn(
                    'border-b-2 px-1 pb-3 text-sm font-medium transition-colors',
                    tab === value ? 'border-brand text-brand' : 'border-transparent text-zinc-500 hover:text-zinc-800',
                  )}
                >
                  {t(`tabs.${value}`)}
                </button>
              ))}
            </nav>
          </div>

          <SheetBody className="receipt-print-area">
            {detailQuery.isPending ? (
              <Skeleton className="h-64 w-full" />
            ) : detailQuery.isError || !detail ? (
              <QueryErrorState onRetry={() => void detailQuery.refetch()} />
            ) : tab === 'paymentMethods' ? (
              <div className="space-y-4">
                <Table>
                  <TableHead>
                    <tr>
                      <TableHeaderCell>{t('paymentMethod')}</TableHeaderCell>
                      <TableHeaderCell>{t('expected')}</TableHeaderCell>
                      <TableHeaderCell>{t('counted')}</TableHeaderCell>
                      <TableHeaderCell>{t('difference')}</TableHeaderCell>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {detail.paymentSummaries.map((summary) => (
                      <TableRow key={summary.paymentMethodId}>
                        <TableCell className="font-medium text-zinc-900">{summary.paymentMethodName}</TableCell>
                        <TableCell>{summary.expectedAmount.toFixed(2)}</TableCell>
                        <TableCell>{summary.countedAmount.toFixed(2)}</TableCell>
                        <TableCell className={summary.difference !== 0 ? 'font-medium text-red-600' : 'text-emerald-600'}>
                          {summary.difference > 0 ? '+' : ''}
                          {summary.difference.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {detail.paymentSummaries.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-zinc-400">
                          {t('registerStillOpen')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                  {detail.paymentSummaries.length > 0 && (
                    <tfoot>
                      <TableRow className="bg-zinc-50 font-semibold text-zinc-900">
                        <TableCell>{t('total')}</TableCell>
                        <TableCell>{(detail.totalExpected ?? 0).toFixed(2)}</TableCell>
                        <TableCell>{(detail.totalCounted ?? 0).toFixed(2)}</TableCell>
                        <TableCell
                          className={
                            (detail.totalDifference ?? 0) !== 0 ? 'text-red-600' : 'text-emerald-600'
                          }
                        >
                          {(detail.totalDifference ?? 0) > 0 ? '+' : ''}
                          {(detail.totalDifference ?? 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </tfoot>
                  )}
                </Table>
              </div>
            ) : tab === 'registerSummary' ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">{t('status')}</span>
                  <StatusBadge status={detail.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">{t('openedBy')}</span>
                  <span className="font-medium text-zinc-900">{detail.openedByName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">{t('openDate')}</span>
                  <span className="font-medium text-zinc-900">{new Date(detail.openedAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">{tRegisters('openingAmount')}</span>
                  <span className="font-medium text-zinc-900">{detail.openingAmount.toFixed(2)}</span>
                </div>
                {detail.closedByName && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">{t('closedBy')}</span>
                    <span className="font-medium text-zinc-900">{detail.closedByName}</span>
                  </div>
                )}
                {detail.closedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">{t('closeDate')}</span>
                    <span className="font-medium text-zinc-900">{new Date(detail.closedAt).toLocaleString()}</span>
                  </div>
                )}
                {detail.totalExpected !== null && (
                  <>
                    <div className="mt-4 border-t border-zinc-100 pt-3" />
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">{t('expected')}</span>
                      <span className="font-medium text-zinc-900">{detail.totalExpected.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">{t('counted')}</span>
                      <span className="font-medium text-zinc-900">{(detail.totalCounted ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-base">
                      <span className="text-zinc-500">{t('difference')}</span>
                      <span
                        className={cn(
                          'font-semibold',
                          (detail.totalDifference ?? 0) !== 0 ? 'text-red-600' : 'text-emerald-600',
                        )}
                      >
                        {(detail.totalDifference ?? 0) > 0 ? '+' : ''}
                        {(detail.totalDifference ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Table>
                <TableHead>
                  <tr>
                    <TableHeaderCell>{tRegisters('cashMovementTypes.IN')}/{tRegisters('cashMovementTypes.OUT')}</TableHeaderCell>
                    <TableHeaderCell>{tRegisters('amount')}</TableHeaderCell>
                    <TableHeaderCell>{tRegisters('reason')}</TableHeaderCell>
                  </tr>
                </TableHead>
                <TableBody>
                  {movementsQuery.isPending ? (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ) : (movementsQuery.data ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-zinc-400">
                        {t('noMovements')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    (movementsQuery.data ?? []).map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>{tRegisters(`cashMovementTypes.${movement.type}`)}</TableCell>
                        <TableCell>{movement.amount.toFixed(2)}</TableCell>
                        <TableCell>{movement.reason ?? ''}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </SheetBody>

          <SheetFooter>
            <Button type="button" variant="ghost" onClick={() => window.print()}>
              <Printer className="size-4" />
              {t('printReport')}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowInvoices(true)}>
              <Receipt className="size-4" />
              {t('sessionInvoices')}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <SessionInvoicesDialog sessionId={showInvoices ? sessionId : null} onOpenChange={(open) => !open && setShowInvoices(false)} />
    </>
  );
}
