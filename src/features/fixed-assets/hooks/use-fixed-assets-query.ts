'use client';

import { useQuery } from '@tanstack/react-query';
import { fixedAssetsApi, type FixedAssetsQuery } from '../api/fixed-assets.api';
import { fixedAssetsKeys } from '../api/fixed-assets.query-keys';

export function useFixedAssetsQuery(query: FixedAssetsQuery = {}) {
  return useQuery({
    queryKey: fixedAssetsKeys.list(query),
    queryFn: () => fixedAssetsApi.list(query),
  });
}
