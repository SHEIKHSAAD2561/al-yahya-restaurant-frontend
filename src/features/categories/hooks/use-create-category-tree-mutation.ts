'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { categoriesApi } from '../api/categories.api';
import { categoriesKeys } from '../api/categories.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useCreateCategoryTreeMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('categoryManagement');

  return useMutation({
    mutationFn: categoriesApi.createTree,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
      toast.success(t('categoryCreated'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
