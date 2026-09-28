'use client';

import { useQuery } from '@tanstack/react-query';
import { salesApi } from '../api/sales.api';
import { salesKeys } from '../api/sales.query-keys';

export function useSaleQuery(id: string | undefined) {
  return useQuery({
    queryKey: salesKeys.detail(id ?? ''),
    queryFn: () => salesApi.get(id!),
    enabled: Boolean(id),
  });
}
