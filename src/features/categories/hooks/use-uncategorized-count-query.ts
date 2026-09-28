'use client';

import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../api/categories.api';
import { categoriesKeys } from '../api/categories.query-keys';

export function useUncategorizedCountQuery() {
  return useQuery({
    queryKey: categoriesKeys.uncategorizedCount(),
    queryFn: categoriesApi.uncategorizedCount,
  });
}
