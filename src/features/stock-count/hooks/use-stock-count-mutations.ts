'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { stockCountsApi, type CreateStockCountInput, type StockCountLineUpdateInput } from '../api/stock-counts.api';
import { stockCountsKeys } from '../api/stock-counts.query-keys';
import { productsKeys } from '@/features/products/api/products.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useCreateStockCountMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('stockCount');

  return useMutation({
    mutationFn: (input: CreateStockCountInput) => stockCountsApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stockCountsKeys.lists() });
      toast.success(t('created'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useUpdateStockCountLinesMutation(id: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('stockCount');

  return useMutation({
    mutationFn: (lines: StockCountLineUpdateInput[]) => stockCountsApi.updateLines(id, lines),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stockCountsKeys.detail(id) });
      toast.success(t('saved'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useConfirmStockCountMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('stockCount');

  return useMutation({
    mutationFn: (id: string) => stockCountsApi.confirm(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: stockCountsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: stockCountsKeys.detail(id) });
      // Confirming adjusts stock quantities — the product grid/list is now stale.
      void queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      toast.success(t('confirmed'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useDeleteStockCountMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('stockCount');

  return useMutation({
    mutationFn: (id: string) => stockCountsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stockCountsKeys.lists() });
      toast.success(t('deleted'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
