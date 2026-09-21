'use client';

import { useQuery } from '@tanstack/react-query';
import { usersApi, type UsersQuery } from '../api/users.api';
import { usersKeys } from '../api/users.query-keys';

export function useUsersQuery(filters: UsersQuery, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: usersKeys.list(filters),
    queryFn: () => usersApi.list(filters),
    enabled: options?.enabled,
  });
}
