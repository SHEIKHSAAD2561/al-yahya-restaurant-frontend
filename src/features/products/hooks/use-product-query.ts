'use client';

import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import { productsKeys } from '../api/products.query-keys';

export function useProductQuery(id: string | undefined) {
  return useQuery({
    queryKey: productsKeys.detail(id ?? ''),
    queryFn: () => productsApi.get(id!),
    enabled: Boolean(id),
  });
}
