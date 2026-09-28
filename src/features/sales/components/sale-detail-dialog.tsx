'use client';

import { useState } from 'react';
import { Printer } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useCompanyBrandingQuery } from '@/features/company/hooks/use-company-branding-query';
import { useReceiptSettingsQuery } from '@/features/receipt-settings/hooks/use-receipt-settings-query';
import { ReceiptDocument } from '@/features/receipt-settings/components/receipt-document';
import { saleDetailToReceiptData } from '@/features/receipt-settings/types/receipt-sale-data';
import { useSaleQuery } from '../hooks/use-sale-query';

export function SaleDetailDialog({ saleId, onOpenChange }: { saleId: string | null; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations('sellScreen');
  const saleQuery = useSaleQuery(saleId ?? undefined);
  const brandingQuery = useCompanyBrandingQuery();
  const receiptSettingsQuery = useReceiptSettingsQuery();
  const [showReceipt, setShowReceipt] = useState(false);
  const sale = saleQuery.data;

  return (
    <Dialog
      open={saleId !== null}
      onOpenChange={(open) => {
        if (!open) setShowReceipt(false);
        onOpenChange(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{sale?.invoiceNumber ?? t('invoiceDetails')}</DialogTitle>
        </DialogHeader>
        {saleQuery.isPending ? (
          <Skeleton className="h-48 w-full" />
        ) : sale ? (
          showReceipt && receiptSettingsQuery.data && brandingQuery.data ? (
            <div className="space-y-3">
              <div className="receipt-print-area max-h-[28rem] overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 p-2 print:max-h-none print:overflow-visible print:border-none print:bg-white">
                <ReceiptDocument
                  settings={receiptSettingsQuery.data}
                  branding={brandingQuery.data}
                  sale={saleDetailToReceiptData(sale)}
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowReceipt(false)}>
                  {t('back')}
                </Button>
                <Button type="button" className="flex-1" onClick={() => window.print()}>
                  <Printer className="size-4" />
                  {t('printReceipt')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="max-h-60 space-y-2 overflow-y-auto">
                {sale.lines.map((line) => (
                  <div key={line.id} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-700">
                      {line.productName} <span className="text-zinc-400">x{line.quantity}</span>
                    </span>
                    <span className="font-medium text-zinc-900">{line.lineTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1 border-t border-zinc-100 pt-2 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>{t('subtotal')}</span>
                  <span>{sale.subtotal.toFixed(2)}</span>
                </div>
                {sale.discountAmount > 0 && (
                  <div className="flex justify-between text-zinc-600">
                    <span>{t('discount')}</span>
                    <span>-{sale.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-600">
                  <span>{t('tax')}</span>
                  <span>{sale.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-zinc-900">
                  <span>{t('total')}</span>
                  <span>{sale.total.toFixed(2)}</span>
                </div>
              </div>
              <Button type="button" variant="outline" className="w-full" onClick={() => setShowReceipt(true)}>
                <Printer className="size-4" />
                {t('printReceipt')}
              </Button>
            </div>
          )
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
