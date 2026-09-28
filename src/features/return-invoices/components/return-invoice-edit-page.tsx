'use client';

import { QueryErrorState } from '@/components/ui/query-error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useReturnInvoiceQuery } from '../hooks/use-return-invoice-query';
import { ReturnInvoiceFormPage } from './return-invoice-form-page';

export function ReturnInvoiceEditPage({ invoiceId }: { invoiceId: string }) {
  const invoiceQuery = useReturnInvoiceQuery(invoiceId);

  if (invoiceQuery.isPending) return <Skeleton className="h-96 w-full" />;
  if (invoiceQuery.isError || !invoiceQuery.data) {
    return <QueryErrorState onRetry={() => void invoiceQuery.refetch()} />;
  }

  return <ReturnInvoiceFormPage key={invoiceQuery.data.updatedAt} invoice={invoiceQuery.data} />;
}
