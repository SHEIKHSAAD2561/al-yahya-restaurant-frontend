'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { categoriesApi } from '../api/categories.api';
import { categoriesKeys } from '../api/categories.query-keys';
import { productsKeys } from '@/features/products/api/products.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useCreateCategoryDetailedMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('categoryManagement');

  return useMutation({
    mutationFn: categoriesApi.createDetailed,
    onSuccess: (_category, input) => {
      void queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
      if (input.assignProductIds?.length) {
        void queryClient.invalidateQueries({ queryKey: categoriesKeys.uncategorizedCount() });
        void queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      }
      toast.success(t('categoryCreated'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
