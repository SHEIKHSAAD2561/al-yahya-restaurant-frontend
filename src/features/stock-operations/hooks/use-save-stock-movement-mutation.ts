'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { stockMovementsApi, type StockMovementInput } from '../api/stock-movements.api';
import { stockMovementsKeys } from '../api/stock-movements.query-keys';
import { productsKeys } from '@/features/products/api/products.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useSaveStockMovementMutation(id?: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('stockOperations');

  return useMutation({
    mutationFn: (input: StockMovementInput) => (id ? stockMovementsApi.update(id, input) : stockMovementsApi.create(input)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stockMovementsKeys.lists() });
      if (id) void queryClient.invalidateQueries({ queryKey: stockMovementsKeys.detail(id) });
      toast.success(id ? t('updated') : t('created'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useConfirmStockMovementMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('stockOperations');

  return useMutation({
    mutationFn: (id: string) => stockMovementsApi.confirm(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: stockMovementsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: stockMovementsKeys.detail(id) });
      // Confirming moves stock — the product grid/list is now stale.
      void queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      toast.success(t('confirmed'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useDeleteStockMovementMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('stockOperations');

  return useMutation({
    mutationFn: (id: string) => stockMovementsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stockMovementsKeys.lists() });
      toast.success(t('deleted'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
