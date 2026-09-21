'use client';

import { useQuery } from '@tanstack/react-query';
import { rolesApi } from '../api/roles.api';
import { rolesKeys } from '../api/roles.query-keys';

export function useRoleQuery(id: string) {
  return useQuery({
    queryKey: rolesKeys.detail(id),
    queryFn: () => rolesApi.get(id),
  });
}
