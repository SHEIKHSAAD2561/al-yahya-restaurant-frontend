'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { productsApi, type ProductsQuery } from '../api/products.api';
import { productsKeys } from '../api/products.query-keys';

export function useProductsQuery(query: ProductsQuery, enabled = true) {
  return useQuery({
    queryKey: productsKeys.list(query),
    queryFn: () => productsApi.list(query),
    // Keep the current page on screen while the next page/filter loads.
    placeholderData: keepPreviousData,
    enabled,
  });
}
