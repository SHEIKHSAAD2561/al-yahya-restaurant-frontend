'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { stockCountsApi, type StockCountsQuery } from '../api/stock-counts.api';
import { stockCountsKeys } from '../api/stock-counts.query-keys';

export function useStockCountsQuery(query: StockCountsQuery) {
  return useQuery({
    queryKey: stockCountsKeys.list(query),
    queryFn: () => stockCountsApi.list(query),
    placeholderData: keepPreviousData,
  });
}
