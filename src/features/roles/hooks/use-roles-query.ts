'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { rolesApi } from '../api/roles.api';
import { rolesKeys } from '../api/roles.query-keys';

export function useRolesQuery() {
  const locale = useLocale();
  return useQuery({
    queryKey: rolesKeys.lists(locale),
    queryFn: rolesApi.list,
  });
}
