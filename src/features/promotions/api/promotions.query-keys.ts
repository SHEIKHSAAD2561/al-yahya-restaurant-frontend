import type { PromotionsQuery } from './promotions.api';

export const promotionsKeys = {
  all: ['promotions'] as const,
  lists: () => [...promotionsKeys.all, 'list'] as const,
  list: (query: PromotionsQuery) => [...promotionsKeys.lists(), query] as const,
  details: () => [...promotionsKeys.all, 'detail'] as const,
  detail: (id: string) => [...promotionsKeys.details(), id] as const,
};
