'use client';

import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import { productsKeys } from '../api/products.query-keys';

export function useProductFormOptionsQuery() {
  return useQuery({
    queryKey: productsKeys.formOptions(),
    queryFn: productsApi.formOptions,
  });
}
