'use client';

import { useQuery } from '@tanstack/react-query';
import { suppliersApi } from '../api/suppliers.api';
import { suppliersKeys } from '../api/suppliers.query-keys';

export function useSuppliersQuery() {
  return useQuery({
    queryKey: suppliersKeys.lists(),
    queryFn: suppliersApi.list,
  });
}
