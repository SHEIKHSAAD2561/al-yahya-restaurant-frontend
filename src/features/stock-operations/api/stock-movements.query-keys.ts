import type { StockMovementsQuery } from './stock-movements.api';

export const stockMovementsKeys = {
  all: ['stock-operations'] as const,
  lists: () => [...stockMovementsKeys.all, 'list'] as const,
  list: (query: StockMovementsQuery) => [...stockMovementsKeys.lists(), query] as const,
  details: () => [...stockMovementsKeys.all, 'detail'] as const,
  detail: (id: string) => [...stockMovementsKeys.details(), id] as const,
};
