'use client';

import { useQuery } from '@tanstack/react-query';
import { fixedAssetsApi } from '../api/fixed-assets.api';
import { fixedAssetsKeys } from '../api/fixed-assets.query-keys';

export function useDepreciationEntriesQuery(fixedAssetId: string | undefined) {
  return useQuery({
    queryKey: fixedAssetsKeys.depreciationEntries(fixedAssetId ?? ''),
    queryFn: () => fixedAssetsApi.listDepreciationEntries(fixedAssetId!),
    enabled: Boolean(fixedAssetId),
  });
}
