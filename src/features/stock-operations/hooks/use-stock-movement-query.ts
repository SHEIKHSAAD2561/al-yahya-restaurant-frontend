'use client';

import { useQuery } from '@tanstack/react-query';
import { stockMovementsApi } from '../api/stock-movements.api';
import { stockMovementsKeys } from '../api/stock-movements.query-keys';

export function useStockMovementQuery(id: string | undefined) {
  return useQuery({
    queryKey: stockMovementsKeys.detail(id ?? ''),
    queryFn: () => stockMovementsApi.get(id!),
    enabled: Boolean(id),
  });
}
