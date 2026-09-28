'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { categoriesApi } from '../api/categories.api';
import { categoriesKeys } from '../api/categories.query-keys';
import { productsKeys } from '@/features/products/api/products.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useAssignProductsMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('categoryManagement');

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
    void queryClient.invalidateQueries({ queryKey: categoriesKeys.uncategorizedCount() });
    void queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
  }

  const assign = useMutation({
    mutationFn: ({ categoryId, productIds }: { categoryId: string; productIds: string[] }) =>
      categoriesApi.assignProducts(categoryId, productIds),
    onSuccess: () => {
      invalidate();
      toast.success(t('productsAssigned'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });

  const unassign = useMutation({
    mutationFn: (productIds: string[]) => categoriesApi.unassignProducts(productIds),
    onSuccess: () => {
      invalidate();
      toast.success(t('productsUnassigned'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });

  return { assign, unassign };
}
