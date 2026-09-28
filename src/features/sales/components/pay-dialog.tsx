'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Printer } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useDisplayName, usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { useCompanyBrandingQuery } from '@/features/company/hooks/use-company-branding-query';
import { useReceiptSettingsQuery } from '@/features/receipt-settings/hooks/use-receipt-settings-query';
import { ReceiptDocument } from '@/features/receipt-settings/components/receipt-document';
import { checkoutToReceiptData } from '@/features/receipt-settings/types/receipt-sale-data';
import { useParkSaleMutation } from '../hooks/use-park-sale-mutation';
import { useCheckoutSaleMutation } from '../hooks/use-checkout-sale-mutation';
import type { CartLine } from '../types/cart';
import type { DiscountType, Sale, SellAt } from '../types/sale';
import type { RegisterPaymentMethodRef } from '@/features/registers/types/register';

interface PayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registerId: string;
  parkedSaleId: string | null;
  customerId: string | null;
  customerName: string | null;
  sellAt: SellAt;
  discountType: DiscountType | null;
  discountValue: number | null;
  note: string;
  lines: CartLine[];
  paymentMethods: RegisterPaymentMethodRef[];
  onCompleted: (sale: Sale) => void;
}

/**
 * On open, parks the current cart to get the server's *authoritative*
 * subtotal/tax/total (never the client's own running total) — the same
 * parked row "Complete Sale" then finishes via `resumedFromSaleId`.
 */
export function PayDialog({
  open,
  onOpenChange,
  registerId,
  parkedSaleId,
  customerId,
  customerName,
  sellAt,
  discountType,
  discountValue,
  note,
  lines,
  paymentMethods,
  onCompleted,
}: PayDialogProps) {
  const t = useTranslations('sellScreen');
  const cashierName = useDisplayName();
  const canPostPayment = usePermission(PERMISSIONS.POS_CHECKOUT_POST_PAYMENT);
  const brandingQuery = useCompanyBrandingQuery();
  const receiptSettingsQuery = useReceiptSettingsQuery();
  const parkMutation = useParkSaleMutation();
  const checkoutMutation = useCheckoutSaleMutation();

  const [preview, setPreview] = useState<Sale | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [tendered, setTendered] = useState('');
  const [isPostPayment, setIsPostPayment] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  // "Adjust state during render" (react.dev) for the reset-on-close part —
  // synchronous setState belongs here, not in the effect body below.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) {
      setPreview(null);
      setPaymentMethodId('');
      setTendered('');
      setIsPostPayment(false);
      setCompletedSale(null);
    }
  }

  useEffect(() => {
    if (!open) return;
    parkMutation.mutate(
      {
        id: parkedSaleId ?? undefined,
        registerId,
        customerId: customerId ?? undefined,
        sellAt,
        discountType: discountType ?? undefined,
        discountValue: discountValue ?? undefined,
        note: note || undefined,
        lines: lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
      },
      {
        onSuccess: (sale) => {
          setPreview(sale);
          setTendered(sale.total.toFixed(2));
        },
      },
    );
    // Only re-run when the dialog opens — the cart is frozen for payment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const tenderedAmount = Number(tendered);
  const change = preview && Number.isFinite(tenderedAmount) ? Math.max(0, tenderedAmount - preview.total) : 0;
  const canPay = preview && (isPostPayment || (paymentMethodId && Number.isFinite(tenderedAmount) && tenderedAmount >= preview.total));
  const paymentMethodName = isPostPayment
    ? t('postPayment')
    : paymentMethods.find((method) => method.id === paymentMethodId)?.name ?? '';

  function handleComplete() {
    if (!preview) return;
    checkoutMutation.mutate(
      {
        id: parkedSaleId ?? undefined,
        registerId,
        customerId: customerId ?? undefined,
        sellAt,
        discountType: discountType ?? undefined,
        discountValue: discountValue ?? undefined,
        note: note || undefined,
        lines: lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
        isPostPayment: isPostPayment || undefined,
        paymentMethodId: isPostPayment ? undefined : paymentMethodId,
        amountTendered: isPostPayment ? undefined : tenderedAmount,
        resumedFromSaleId: preview.id,
      },
      {
        onSuccess: (sale) => {
          toast.success(t('saleCompleted', { invoiceNumber: sale.invoiceNumber ?? '' }));
          onCompleted(sale);
          setCompletedSale(sale);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('pay')}</DialogTitle>
        </DialogHeader>

        {completedSale ? (
          <div className="space-y-4">
            {receiptSettingsQuery.data && brandingQuery.data && (
              <div className="receipt-print-area max-h-[28rem] overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 p-2 print:max-h-none print:overflow-visible print:border-none print:bg-white">
                <ReceiptDocument
                  settings={receiptSettingsQuery.data}
                  branding={brandingQuery.data}
                  sale={checkoutToReceiptData(
                    completedSale,
                    lines,
                    paymentMethodName,
                    cashierName,
                    customerName,
                    tenderedAmount,
                  )}
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => window.print()}>
                <Printer className="size-4" />
                {t('printReceipt')}
              </Button>
              <Button type="button" className="flex-1" onClick={() => onOpenChange(false)}>
                {t('done')}
              </Button>
            </div>
          </div>
        ) : !preview ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="space-y-4">
            <div className="space-y-1 rounded-lg bg-zinc-50 p-3 text-sm">
              <div className="flex justify-between text-zinc-600">
                <span>{t('subtotal')}</span>
                <span>{preview.subtotal.toFixed(2)}</span>
              </div>
              {preview.discountAmount > 0 && (
                <div className="flex justify-between text-zinc-600">
                  <span>{t('discount')}</span>
                  <span>-{preview.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-600">
                <span>{t('tax')}</span>
                <span>{preview.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-1 text-base font-semibold text-zinc-900">
                <span>{t('total')}</span>
                <span>{preview.total.toFixed(2)}</span>
              </div>
            </div>

            {canPostPayment && customerId && (
              <button
                type="button"
                onClick={() => setIsPostPayment((current) => !current)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
                  isPostPayment ? 'border-brand bg-brand-muted text-brand' : 'border-zinc-200 text-zinc-600',
                )}
              >
                <span>{t('postPayment')}</span>
                <span className="text-xs font-normal text-zinc-400">{isPostPayment ? t('on') : t('off')}</span>
              </button>
            )}

            {isPostPayment ? (
              <p className="rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
                {t('postPaymentNote', { customerName: customerName ?? '' })}
              </p>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label>{t('paymentMethod')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethodId(method.id)}
                        className={cn(
                          'flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors',
                          paymentMethodId === method.id
                            ? 'border-brand bg-brand-muted text-brand'
                            : 'border-zinc-200 text-zinc-600',
                        )}
                      >
                        <CreditCard className="size-4" />
                        {method.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="amountTendered">{t('amountTendered')}</Label>
                  <Input
                    id="amountTendered"
                    type="number"
                    step="0.01"
                    min="0"
                    value={tendered}
                    onChange={(event) => setTendered(event.target.value)}
                  />
                </div>

                {change > 0 && (
                  <p className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                    <span>{t('change')}</span>
                    <span>{change.toFixed(2)}</span>
                  </p>
                )}
              </>
            )}

            <Button className="w-full" disabled={!canPay || checkoutMutation.isPending} onClick={handleComplete}>
              {t('completeSale')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
