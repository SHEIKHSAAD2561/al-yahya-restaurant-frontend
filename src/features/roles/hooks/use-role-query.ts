'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { rolesApi } from '../api/roles.api';
import { rolesKeys } from '../api/roles.query-keys';

export function useRoleQuery(id: string) {
  const locale = useLocale();
  return useQuery({
    queryKey: rolesKeys.detail(id, locale),
    queryFn: () => rolesApi.get(id),
  });
}
