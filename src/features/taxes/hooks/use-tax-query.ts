'use client';

import { useQuery } from '@tanstack/react-query';
import { taxesApi } from '../api/taxes.api';
import { taxesKeys } from '../api/taxes.query-keys';

export function useTaxQuery(id: string) {
  return useQuery({
    queryKey: taxesKeys.detail(id),
    queryFn: () => taxesApi.get(id),
  });
}
