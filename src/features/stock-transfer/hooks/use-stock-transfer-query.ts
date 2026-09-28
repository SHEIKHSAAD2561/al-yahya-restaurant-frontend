'use client';

import { useQuery } from '@tanstack/react-query';
import { stockTransfersApi } from '../api/stock-transfers.api';
import { stockTransfersKeys } from '../api/stock-transfers.query-keys';

export function useStockTransferQuery(id: string | undefined) {
  return useQuery({
    queryKey: stockTransfersKeys.detail(id ?? ''),
    queryFn: () => stockTransfersApi.get(id!),
    enabled: Boolean(id),
  });
}
