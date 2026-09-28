'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { returnInvoicesApi, type ReturnInvoicesQuery } from '../api/return-invoices.api';
import { returnInvoicesKeys } from '../api/return-invoices.query-keys';

export function useReturnInvoicesQuery(query: ReturnInvoicesQuery) {
  return useQuery({
    queryKey: returnInvoicesKeys.list(query),
    queryFn: () => returnInvoicesApi.list(query),
    placeholderData: keepPreviousData,
  });
}
