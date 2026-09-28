'use client';

import { ArrowLeft, Printer } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { QueryErrorState } from '@/components/ui/query-error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/core/i18n/navigation';
import { useCompanyBrandingQuery } from '@/features/company/hooks/use-company-branding-query';
import { useReceiptSettingsQuery } from '@/features/receipt-settings/hooks/use-receipt-settings-query';
import { ReceiptDocument } from '@/features/receipt-settings/components/receipt-document';
import { saleDetailToReceiptData } from '@/features/receipt-settings/types/receipt-sale-data';
import { useSaleQuery } from '../hooks/use-sale-query';

export function InvoiceDetailsPage({ saleId }: { saleId: string }) {
  const t = useTranslations('sellScreen');
  const saleQuery = useSaleQuery(saleId);
  const brandingQuery = useCompanyBrandingQuery();
  const receiptSettingsQuery = useReceiptSettingsQuery();

  if (saleQuery.isPending || brandingQuery.isPending || receiptSettingsQuery.isPending) {
    return <Skeleton className="h-96 w-full" />;
  }
  if (saleQuery.isError || !saleQuery.data || !brandingQuery.data || !receiptSettingsQuery.data) {
    return <QueryErrorState onRetry={() => void saleQuery.refetch()} />;
  }
  const sale = saleQuery.data;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/sale-invoices"
            aria-label={t('back')}
            className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100"
          >
            <ArrowLeft className="size-5 rtl:rotate-180" />
          </Link>
          <h1 className="text-lg font-semibold text-zinc-900">{sale.invoiceNumber ?? t('invoiceDetails')}</h1>
        </div>
        <Button type="button" onClick={() => window.print()}>
          <Printer className="size-4" />
          {t('printReceipt')}
        </Button>
      </div>

      <div className="receipt-print-area rounded-2xl border border-zinc-200 bg-zinc-50 p-4 print:border-none print:bg-white">
        <ReceiptDocument settings={receiptSettingsQuery.data} branding={brandingQuery.data} sale={saleDetailToReceiptData(sale)} />
      </div>
    </div>
  );
}
