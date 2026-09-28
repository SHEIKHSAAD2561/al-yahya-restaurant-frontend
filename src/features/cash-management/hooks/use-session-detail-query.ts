'use client';

import { useQuery } from '@tanstack/react-query';
import { cashManagementApi } from '../api/cash-management.api';
import { cashManagementKeys } from '../api/cash-management.query-keys';

export function useSessionDetailQuery(id: string | null) {
  return useQuery({
    queryKey: cashManagementKeys.detail(id ?? ''),
    queryFn: () => cashManagementApi.getSessionDetail(id!),
    enabled: id !== null,
  });
}
