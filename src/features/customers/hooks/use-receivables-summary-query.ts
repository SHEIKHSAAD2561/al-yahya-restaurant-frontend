'use client';

import { useQuery } from '@tanstack/react-query';
import { customersApi } from '../api/customers.api';
import { customersKeys } from '../api/customers.query-keys';

/** Backs the Customer Payments page's "Total Outstanding" card. */
export function useReceivablesSummaryQuery() {
  return useQuery({
    queryKey: [...customersKeys.all, 'receivables-summary'] as const,
    queryFn: () => customersApi.receivablesSummary(),
  });
}
