'use client';

import { useQuery } from '@tanstack/react-query';
import { rolesApi } from '../api/roles.api';
import { rolesKeys } from '../api/roles.query-keys';

export function useRolesQuery() {
  return useQuery({
    queryKey: rolesKeys.lists(),
    queryFn: rolesApi.list,
  });
}
