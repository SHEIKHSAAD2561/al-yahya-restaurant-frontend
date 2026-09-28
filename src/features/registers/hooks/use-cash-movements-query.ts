'use client';

import { useQuery } from '@tanstack/react-query';
import { registersApi } from '../api/registers.api';
import { registersKeys } from '../api/registers.query-keys';

export function useCashMovementsQuery(registerId: string, enabled = true) {
  return useQuery({
    queryKey: registersKeys.cashMovements(registerId),
    queryFn: () => registersApi.listCashMovements(registerId),
    enabled,
  });
}
