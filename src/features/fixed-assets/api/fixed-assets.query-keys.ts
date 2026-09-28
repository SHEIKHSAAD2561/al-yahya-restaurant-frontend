import type { FixedAssetsQuery } from './fixed-assets.api';

export const fixedAssetsKeys = {
  all: ['fixed-assets'] as const,
  lists: () => [...fixedAssetsKeys.all, 'list'] as const,
  list: (query: FixedAssetsQuery) => [...fixedAssetsKeys.lists(), query] as const,
  details: () => [...fixedAssetsKeys.all, 'detail'] as const,
  detail: (id: string) => [...fixedAssetsKeys.details(), id] as const,
  depreciationEntries: (id: string) => [...fixedAssetsKeys.detail(id), 'depreciation-entries'] as const,
};
