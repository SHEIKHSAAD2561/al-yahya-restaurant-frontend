'use client';

import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { salesApi } from '../api/sales.api';
import { useParkedSalesQuery } from '../hooks/use-parked-sales-query';
import { useDiscardParkedSaleMutation } from '../hooks/use-discard-parked-sale-mutation';
import type { Sale } from '../types/sale';

interface ParkedSalesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registerId: string;
  onResume: (sale: Sale) => void;
}

/** "Continue Sale" (shown when the cart is empty) — pick a previously
 * paused sale to bring back into the cart. */
export function ParkedSalesDialog({ open, onOpenChange, registerId, onResume }: ParkedSalesDialogProps) {
  const t = useTranslations('sellScreen');
  const parkedQuery = useParkedSalesQuery(registerId);
  const discardMutation = useDiscardParkedSaleMutation(registerId);

  async function resume(id: string) {
    const detail = await salesApi.getParkedDetail(id);
    onResume(detail);
    onOpenChange(false);
  }

  const parked = parkedQuery.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('parkedSales')}</DialogTitle>
        </DialogHeader>
        {parked.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-400">{t('noParkedSales')}</p>
        ) : (
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {parked.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">{sale.customerName ?? t('walkInCustomer')}</p>
                  <p className="text-xs text-zinc-500">
                    {t('itemCount', { count: sale.itemCount })} · {sale.total.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => void resume(sale.id)}>
                    {t('resume')}
                  </Button>
                  <button
                    type="button"
                    onClick={() => discardMutation.mutate(sale.id)}
                    aria-label={t('discard')}
                    className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
