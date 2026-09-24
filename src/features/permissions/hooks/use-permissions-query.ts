'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { permissionsApi } from '../api/permissions.api';
import { permissionsKeys } from '../api/permissions.query-keys';

/** The permission catalog changes essentially never — long staleTime. Locale
 * is still in the key (see permissions.query-keys.ts) since descriptions are
 * localized server-side; the long staleTime just means a locale switch is
 * the main thing that'll ever cause a refetch here. */
export function usePermissionsQuery() {
  const locale = useLocale();
  return useQuery({
    queryKey: permissionsKeys.all(locale),
    queryFn: permissionsApi.listGroupedByModule,
    staleTime: 5 * 60 * 1000,
  });
}
