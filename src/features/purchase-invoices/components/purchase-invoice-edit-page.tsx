'use client';

import { QueryErrorState } from '@/components/ui/query-error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { usePurchaseInvoiceQuery } from '../hooks/use-purchase-invoice-query';
import { PurchaseInvoiceFormPage } from './purchase-invoice-form-page';

export function PurchaseInvoiceEditPage({ invoiceId }: { invoiceId: string }) {
  const invoiceQuery = usePurchaseInvoiceQuery(invoiceId);

  if (invoiceQuery.isPending) return <Skeleton className="h-96 w-full" />;
  if (invoiceQuery.isError || !invoiceQuery.data) {
    return <QueryErrorState onRetry={() => void invoiceQuery.refetch()} />;
  }

  return <PurchaseInvoiceFormPage key={invoiceQuery.data.updatedAt} invoice={invoiceQuery.data} />;
}
