'use client';

import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../api/categories.api';
import { categoriesKeys } from '../api/categories.query-keys';

export function useCategoriesQuery() {
  return useQuery({
    queryKey: categoriesKeys.lists(),
    queryFn: categoriesApi.list,
  });
}
