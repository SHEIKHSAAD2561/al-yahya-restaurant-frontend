'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { purchaseInvoicesApi, type PurchaseInvoicesQuery } from '../api/purchase-invoices.api';
import { purchaseInvoicesKeys } from '../api/purchase-invoices.query-keys';

export function usePurchaseInvoicesQuery(query: PurchaseInvoicesQuery) {
  return useQuery({
    queryKey: purchaseInvoicesKeys.list(query),
    queryFn: () => purchaseInvoicesApi.list(query),
    placeholderData: keepPreviousData,
  });
}
