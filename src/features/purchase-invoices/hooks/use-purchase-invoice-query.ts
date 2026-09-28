'use client';

import { useQuery } from '@tanstack/react-query';
import { purchaseInvoicesApi } from '../api/purchase-invoices.api';
import { purchaseInvoicesKeys } from '../api/purchase-invoices.query-keys';

export function usePurchaseInvoiceQuery(id: string | undefined) {
  return useQuery({
    queryKey: purchaseInvoicesKeys.detail(id ?? ''),
    queryFn: () => purchaseInvoicesApi.get(id!),
    enabled: Boolean(id),
  });
}
