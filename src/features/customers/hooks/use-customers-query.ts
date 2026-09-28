'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { customersApi, type CustomersQuery } from '../api/customers.api';
import { customersKeys } from '../api/customers.query-keys';

export function useCustomersQuery(query: CustomersQuery) {
  return useQuery({
    queryKey: customersKeys.list(query),
    queryFn: () => customersApi.list(query),
    placeholderData: keepPreviousData,
  });
}
