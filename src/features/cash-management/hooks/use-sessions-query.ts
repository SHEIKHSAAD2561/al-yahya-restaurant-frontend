'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { cashManagementApi, type SessionsQuery } from '../api/cash-management.api';
import { cashManagementKeys } from '../api/cash-management.query-keys';

export function useSessionsQuery(query: SessionsQuery) {
  return useQuery({
    queryKey: cashManagementKeys.list(query),
    queryFn: () => cashManagementApi.listSessions(query),
    placeholderData: keepPreviousData,
  });
}
