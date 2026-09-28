import type { CompanyBranding } from '@/features/company/types/company';
import type { ReceiptSettings } from '../types/receipt-settings';
import type { ReceiptSaleData } from '../types/receipt-sale-data';
import { cn } from '@/lib/utils';

interface ReceiptDocumentProps {
  settings: ReceiptSettings;
  branding: CompanyBranding;
  sale: ReceiptSaleData;
  className?: string;
}

const fmt = (value: number) => value.toFixed(2);

/**
 * The actual printable receipt — reused by the settings page's live preview,
 * the Pay dialog's success screen, the Invoice List's print icon, and the
 * Invoice Details page, so all four always render the exact same document
 * for the exact same `ReceiptSettings` row. `printLayout` only changes the
 * page width (`THERMAL` narrow, `A4` full-width); every `show*` toggle is a
 * plain conditional render, nothing is ever computed differently per layout.
 */
export function ReceiptDocument({ settings, branding, sale, className }: ReceiptDocumentProps) {
  const isThermal = settings.printLayout === 'THERMAL';
  const isArabic = settings.language === 'AR';

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className={cn(
        'mx-auto space-y-3 bg-white p-4 font-mono text-xs text-zinc-900',
        isThermal ? 'w-72' : 'w-full max-w-md text-sm',
        className,
      )}
    >
      <div className="space-y-1 text-center">
        {settings.showLogo && branding.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- printable receipt, not a Next-optimized page image
          <img src={branding.logoUrl} alt="" className="mx-auto h-12 w-auto object-contain" />
        )}
        {settings.showCompanyName && branding.name && (
          <p className="font-semibold">{branding.name}</p>
        )}
        {settings.showCompanyAddress && branding.address && <p>{branding.address}</p>}
        {settings.showCompanyPhone && branding.phone && <p>{branding.phone}</p>}
        {settings.showVatNumber && branding.vatNumber && <p>VAT: {branding.vatNumber}</p>}
        {settings.showCrNumber && branding.commercialRegister && <p>CR: {branding.commercialRegister}</p>}
      </div>

      <div className="border-t border-dashed border-zinc-300 pt-2 text-[11px]">
        {sale.invoiceNumber && <p>Invoice: {sale.invoiceNumber}</p>}
        <p>{new Date(sale.createdAt).toLocaleString()}</p>
        {settings.showCashierName && sale.cashierName && <p>Cashier: {sale.cashierName}</p>}
        {settings.showCustomerName && sale.customerName && <p>Customer: {sale.customerName}</p>}
      </div>

      <table className="w-full border-t border-dashed border-zinc-300 pt-2 text-[11px]">
        <tbody>
          {sale.lines.map((line, index) => (
            <tr key={index} className="align-top">
              <td className="py-0.5 pe-1">
                {line.productName}
                {settings.showSku && <span className="block text-zinc-500">{line.sku}</span>}
                {settings.showQuantity && (
                  <span className="block text-zinc-500">
                    {line.quantity} x {fmt(line.unitPrice)}
                  </span>
                )}
              </td>
              <td className="py-0.5 text-end">{settings.showUnitPrice ? fmt(line.lineTotal) : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-0.5 border-t border-dashed border-zinc-300 pt-2 text-[11px]">
        {settings.showSubtotal && (
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{fmt(sale.subtotal)}</span>
          </div>
        )}
        {settings.showDiscount && sale.discountAmount > 0 && (
          <div className="flex justify-between">
            <span>Discount</span>
            <span>-{fmt(sale.discountAmount)}</span>
          </div>
        )}
        {settings.showTaxSummary && (
          <div className="flex justify-between">
            <span>Tax</span>
            <span>{fmt(sale.taxAmount)}</span>
          </div>
        )}
        {settings.showTotal && (
          <div className="flex justify-between text-sm font-semibold">
            <span>Total</span>
            <span>{fmt(sale.total)}</span>
          </div>
        )}
        {settings.showPaymentMethod && (
          <div className="flex justify-between">
            <span>Payment</span>
            <span>{sale.paymentMethodName || 'Pay Later'}</span>
          </div>
        )}
        {settings.showAmountPaid && sale.amountPaid !== null && (
          <div className="flex justify-between">
            <span>Paid</span>
            <span>{fmt(sale.amountPaid)}</span>
          </div>
        )}
        {settings.showChangeDue && sale.changeDue !== null && sale.changeDue > 0 && (
          <div className="flex justify-between">
            <span>Change</span>
            <span>{fmt(sale.changeDue)}</span>
          </div>
        )}
      </div>

      {settings.showQrCode && (
        <div className="flex justify-center border-t border-dashed border-zinc-300 pt-2">
          <div className="flex size-16 items-center justify-center border border-zinc-300 text-[9px] text-zinc-400">
            QR
          </div>
        </div>
      )}

      {(settings.salesNote || settings.commentImageUrl || settings.showThankYouNote) && (
        <div className="space-y-1 border-t border-dashed border-zinc-300 pt-2 text-center text-[11px]">
          {settings.salesNote && <p>{settings.salesNote}</p>}
          {settings.commentImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- printable receipt, not a Next-optimized page image
            <img src={settings.commentImageUrl} alt="" className="mx-auto h-10 w-auto object-contain" />
          )}
          {settings.showThankYouNote && <p>Thank you!</p>}
        </div>
      )}
    </div>
  );
}
