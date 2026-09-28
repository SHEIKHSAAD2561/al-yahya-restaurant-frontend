'use client';

import { useQuery } from '@tanstack/react-query';
import { accountsApi, type AccountsQuery } from '../api/accounts.api';
import { accountsKeys } from '../api/accounts.query-keys';

export function useAccountsQuery(query: AccountsQuery = {}) {
  return useQuery({
    queryKey: accountsKeys.list(query),
    queryFn: () => accountsApi.list(query),
  });
}
