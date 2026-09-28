'use client';

import { useQuery } from '@tanstack/react-query';
import { returnInvoicesApi } from '../api/return-invoices.api';
import { returnInvoicesKeys } from '../api/return-invoices.query-keys';

export function useReturnInvoiceQuery(id: string | undefined) {
  return useQuery({
    queryKey: returnInvoicesKeys.detail(id ?? ''),
    queryFn: () => returnInvoicesApi.get(id!),
    enabled: Boolean(id),
  });
}
