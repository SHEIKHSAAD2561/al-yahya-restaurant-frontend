'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { promotionsApi, type PromotionsQuery } from '../api/promotions.api';
import { promotionsKeys } from '../api/promotions.query-keys';

export function usePromotionsQuery(query: PromotionsQuery) {
  return useQuery({
    queryKey: promotionsKeys.list(query),
    queryFn: () => promotionsApi.list(query),
    placeholderData: keepPreviousData,
  });
}
