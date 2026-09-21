'use client';

import { useQuery } from '@tanstack/react-query';
import { permissionsApi } from '../api/permissions.api';
import { permissionsKeys } from '../api/permissions.query-keys';

/** The permission catalog changes essentially never — long staleTime. */
export function usePermissionsQuery() {
  return useQuery({
    queryKey: permissionsKeys.all,
    queryFn: permissionsApi.listGroupedByModule,
    staleTime: 5 * 60 * 1000,
  });
}
