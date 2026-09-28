'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { salesApi, type SalesQuery } from '../api/sales.api';
import { salesKeys } from '../api/sales.query-keys';

export function useSalesQuery(query: SalesQuery) {
  return useQuery({
    queryKey: salesKeys.list(query),
    queryFn: () => salesApi.list(query),
    placeholderData: keepPreviousData,
  });
}
