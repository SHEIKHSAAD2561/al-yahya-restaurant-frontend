'use client';

import { useQuery } from '@tanstack/react-query';
import { brandsApi } from '../api/brands.api';
import { brandsKeys } from '../api/brands.query-keys';

export function useBrandsQuery() {
  return useQuery({
    queryKey: brandsKeys.lists(),
    queryFn: brandsApi.list,
  });
}
