import type { StockTransfersQuery } from './stock-transfers.api';

export const stockTransfersKeys = {
  all: ['stock-transfers'] as const,
  lists: () => [...stockTransfersKeys.all, 'list'] as const,
  list: (query: StockTransfersQuery) => [...stockTransfersKeys.lists(), query] as const,
  details: () => [...stockTransfersKeys.all, 'detail'] as const,
  detail: (id: string) => [...stockTransfersKeys.details(), id] as const,
};
