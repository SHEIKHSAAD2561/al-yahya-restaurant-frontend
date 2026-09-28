'use client';

import { useQuery } from '@tanstack/react-query';
import { stockCountsApi } from '../api/stock-counts.api';
import { stockCountsKeys } from '../api/stock-counts.query-keys';

export function useStockCountQuery(id: string | undefined) {
  return useQuery({
    queryKey: stockCountsKeys.detail(id ?? ''),
    queryFn: () => stockCountsApi.get(id!),
    enabled: Boolean(id),
  });
}
