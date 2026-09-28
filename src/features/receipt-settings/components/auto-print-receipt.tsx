'use client';

import { useEffect } from 'react';
import { useSaleQuery } from '@/features/sales/hooks/use-sale-query';
import { useCompanyBrandingQuery } from '@/features/company/hooks/use-company-branding-query';
import { useReceiptSettingsQuery } from '../hooks/use-receipt-settings-query';
import { saleDetailToReceiptData } from '../types/receipt-sale-data';
import { ReceiptDocument } from './receipt-document';

/**
 * Headless "print icon per row" helper for the Sale Invoices list — renders
 * nothing on screen (`hidden print:block`, paired with the global
 * `.receipt-print-area` rule in globals.css), fetches the sale, and fires
 * `window.print()` as soon as everything it needs has loaded. `onDone` fires
 * on the browser's `afterprint` event (print or cancel), so the caller can
 * reset back to no row being "the one printing".
 */
export function AutoPrintReceipt({ saleId, onDone }: { saleId: string; onDone: () => void }) {
  const saleQuery = useSaleQuery(saleId);
  const brandingQuery = useCompanyBrandingQuery();
  const receiptSettingsQuery = useReceiptSettingsQuery();
  const ready = Boolean(saleQuery.data && brandingQuery.data && receiptSettingsQuery.data);

  useEffect(() => {
    if (!ready) return;
    window.print();
  }, [ready]);

  useEffect(() => {
    window.addEventListener('afterprint', onDone);
    return () => window.removeEventListener('afterprint', onDone);
  }, [onDone]);

  if (!ready) return null;
  return (
    <div className="receipt-print-area hidden print:block">
      <ReceiptDocument
        settings={receiptSettingsQuery.data!}
        branding={brandingQuery.data!}
        sale={saleDetailToReceiptData(saleQuery.data!)}
      />
    </div>
  );
}
