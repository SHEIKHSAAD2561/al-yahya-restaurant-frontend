'use client';

import { useQuery } from '@tanstack/react-query';
import { customersApi } from '../api/customers.api';
import { customersKeys } from '../api/customers.query-keys';

export function useCustomerQuery(id: string | undefined) {
  return useQuery({
    queryKey: customersKeys.detail(id ?? ''),
    queryFn: () => customersApi.get(id!),
    enabled: Boolean(id),
  });
}
