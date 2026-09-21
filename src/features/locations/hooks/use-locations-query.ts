'use client';

import { useQuery } from '@tanstack/react-query';
import { locationsApi } from '../api/locations.api';
import { locationsKeys } from '../api/locations.query-keys';

export function useLocationsQuery() {
  return useQuery({
    queryKey: locationsKeys.lists(),
    queryFn: locationsApi.list,
  });
}
