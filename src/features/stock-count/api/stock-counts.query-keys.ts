import type { StockCountsQuery } from './stock-counts.api';

export const stockCountsKeys = {
  all: ['stock-count'] as const,
  lists: () => [...stockCountsKeys.all, 'list'] as const,
  list: (query: StockCountsQuery) => [...stockCountsKeys.lists(), query] as const,
  details: () => [...stockCountsKeys.all, 'detail'] as const,
  detail: (id: string) => [...stockCountsKeys.details(), id] as const,
};
