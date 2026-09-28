'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { productsApi } from '../api/products.api';
import { productsKeys } from '../api/products.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useBulkUpdatePricingMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('products');

  return useMutation({
    mutationFn: productsApi.bulkUpdatePricing,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: productsKeys.details() });
      toast.success(t('bulkEdit.saved', { count: result.updated }));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
