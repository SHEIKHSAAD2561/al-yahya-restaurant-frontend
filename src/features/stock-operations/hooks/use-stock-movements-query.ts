'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { stockMovementsApi, type StockMovementsQuery } from '../api/stock-movements.api';
import { stockMovementsKeys } from '../api/stock-movements.query-keys';

export function useStockMovementsQuery(query: StockMovementsQuery) {
  return useQuery({
    queryKey: stockMovementsKeys.list(query),
    queryFn: () => stockMovementsApi.list(query),
    placeholderData: keepPreviousData,
  });
}
