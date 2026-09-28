'use client';

import { useQuery } from '@tanstack/react-query';
import { registersApi } from '../api/registers.api';
import { registersKeys } from '../api/registers.query-keys';

export function useRegistersQuery() {
  return useQuery({
    queryKey: registersKeys.lists(),
    queryFn: registersApi.list,
  });
}
