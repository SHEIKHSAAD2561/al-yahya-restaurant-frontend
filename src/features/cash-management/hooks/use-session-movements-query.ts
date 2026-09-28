'use client';

import { useQuery } from '@tanstack/react-query';
import { cashManagementApi } from '../api/cash-management.api';
import { cashManagementKeys } from '../api/cash-management.query-keys';

export function useSessionMovementsQuery(id: string | null) {
  return useQuery({
    queryKey: cashManagementKeys.movements(id ?? ''),
    queryFn: () => cashManagementApi.listMovements(id!),
    enabled: id !== null,
  });
}
