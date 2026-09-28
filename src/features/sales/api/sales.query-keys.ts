import type { SalesQuery } from './sales.api';

export const salesKeys = {
  all: ['sales'] as const,
  lists: () => [...salesKeys.all, 'list'] as const,
  list: (query: SalesQuery) => [...salesKeys.lists(), query] as const,
  detail: (id: string) => [...salesKeys.all, 'detail', id] as const,
  parked: (registerId: string) => [...salesKeys.all, 'parked', registerId] as const,
  parkedDetail: (id: string) => [...salesKeys.all, 'parked-detail', id] as const,
};
