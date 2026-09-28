'use client';

import { useQuery } from '@tanstack/react-query';
import { promotionsApi } from '../api/promotions.api';
import { promotionsKeys } from '../api/promotions.query-keys';

export function usePromotionQuery(id: string | undefined) {
  return useQuery({
    queryKey: promotionsKeys.detail(id ?? ''),
    queryFn: () => promotionsApi.get(id!),
    enabled: Boolean(id),
  });
}
