'use client';

import { useQuery } from '@tanstack/react-query';
import { registersApi } from '../api/registers.api';
import { registersKeys } from '../api/registers.query-keys';

export function useRegisterQuery(id: string | undefined) {
  return useQuery({
    queryKey: registersKeys.detail(id ?? ''),
    queryFn: () => registersApi.get(id!),
    enabled: Boolean(id),
  });
}
