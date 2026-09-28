'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { stockTransfersApi, type StockTransfersQuery } from '../api/stock-transfers.api';
import { stockTransfersKeys } from '../api/stock-transfers.query-keys';

export function useStockTransfersQuery(query: StockTransfersQuery) {
  return useQuery({
    queryKey: stockTransfersKeys.list(query),
    queryFn: () => stockTransfersApi.list(query),
    placeholderData: keepPreviousData,
  });
}
