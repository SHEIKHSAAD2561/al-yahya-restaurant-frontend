'use client';

import { QueryErrorState } from '@/components/ui/query-error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useStockMovementQuery } from '../hooks/use-stock-movement-query';
import { StockMovementFormPage } from './stock-movement-form-page';

export function StockMovementEditPage({ movementId }: { movementId: string }) {
  const movementQuery = useStockMovementQuery(movementId);

  if (movementQuery.isPending) return <Skeleton className="h-96 w-full" />;
  if (movementQuery.isError || !movementQuery.data) {
    return <QueryErrorState onRetry={() => void movementQuery.refetch()} />;
  }

  return <StockMovementFormPage key={movementQuery.data.updatedAt} movement={movementQuery.data} />;
}
