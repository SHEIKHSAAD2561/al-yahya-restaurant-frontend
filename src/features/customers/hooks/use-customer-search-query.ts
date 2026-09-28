'use client';

import { useQuery } from '@tanstack/react-query';
import { customersApi } from '../api/customers.api';
import { customersKeys } from '../api/customers.query-keys';

/** POS "Add Customer" search — only fires once the user has typed something. */
export function useCustomerSearchQuery(term: string) {
  return useQuery({
    queryKey: customersKeys.search(term),
    queryFn: () => customersApi.search(term),
    enabled: term.trim().length > 0,
  });
}
