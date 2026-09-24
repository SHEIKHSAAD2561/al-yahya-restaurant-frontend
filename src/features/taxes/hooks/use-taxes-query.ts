'use client';

import { useQuery } from '@tanstack/react-query';
import { taxesApi } from '../api/taxes.api';
import { taxesKeys } from '../api/taxes.query-keys';

export function useTaxesQuery() {
  return useQuery({
    queryKey: taxesKeys.lists(),
    queryFn: taxesApi.list,
  });
}
