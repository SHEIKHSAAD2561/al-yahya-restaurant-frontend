'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { stockTransfersApi, type StockTransferInput } from '../api/stock-transfers.api';
import { stockTransfersKeys } from '../api/stock-transfers.query-keys';
import { productsKeys } from '@/features/products/api/products.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useCreateStockTransferMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('stockTransfer');

  return useMutation({
    mutationFn: (input: StockTransferInput) => stockTransfersApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stockTransfersKeys.lists() });
      toast.success(t('created'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useCancelStockTransferMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('stockTransfer');

  return useMutation({
    mutationFn: (id: string) => stockTransfersApi.cancel(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: stockTransfersKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: stockTransfersKeys.detail(id) });
      toast.success(t('cancelled'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useApproveStockTransferMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('stockTransfer');

  return useMutation({
    mutationFn: (id: string) => stockTransfersApi.approve(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: stockTransfersKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: stockTransfersKeys.detail(id) });
      // Approving moves stock between locations — the product grid/list is now stale.
      void queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      toast.success(t('approved'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useRejectStockTransferMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('stockTransfer');

  return useMutation({
    mutationFn: (id: string) => stockTransfersApi.reject(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: stockTransfersKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: stockTransfersKeys.detail(id) });
      toast.success(t('rejected'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
