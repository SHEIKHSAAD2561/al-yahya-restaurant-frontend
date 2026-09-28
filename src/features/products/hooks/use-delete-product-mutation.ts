'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { productsApi } from '../api/products.api';
import { productsKeys } from '../api/products.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('products');

  return useMutation({
    mutationFn: productsApi.remove,
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      queryClient.removeQueries({ queryKey: productsKeys.detail(id) });
      toast.success(t('deleted'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
