'use client';

import { useQuery } from '@tanstack/react-query';
import { salesApi } from '../api/sales.api';
import { salesKeys } from '../api/sales.query-keys';

export function useParkedSalesQuery(registerId: string) {
  return useQuery({
    queryKey: salesKeys.parked(registerId),
    queryFn: () => salesApi.listParked(registerId),
  });
}
