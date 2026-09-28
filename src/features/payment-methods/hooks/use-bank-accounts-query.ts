'use client';

import { useQuery } from '@tanstack/react-query';
import { bankAccountsApi } from '../api/payment-methods.api';
import { bankAccountsKeys } from '../api/payment-methods.query-keys';

export function useBankAccountsQuery() {
  return useQuery({
    queryKey: bankAccountsKeys.lists(),
    queryFn: bankAccountsApi.list,
  });
}
