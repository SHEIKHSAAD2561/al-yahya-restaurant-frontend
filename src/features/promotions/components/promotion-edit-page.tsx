'use client';

import { QueryErrorState } from '@/components/ui/query-error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { usePromotionQuery } from '../hooks/use-promotion-query';
import { PromotionFormPage } from './promotion-form-page';

export function PromotionEditPage({ promotionId }: { promotionId: string }) {
  const promotionQuery = usePromotionQuery(promotionId);

  if (promotionQuery.isPending) return <Skeleton className="h-96 w-full" />;
  if (promotionQuery.isError || !promotionQuery.data) {
    return <QueryErrorState onRetry={() => void promotionQuery.refetch()} />;
  }
  const promotion = promotionQuery.data;

  return <PromotionFormPage key={promotion.updatedAt} type={promotion.type} promotion={promotion} />;
}
