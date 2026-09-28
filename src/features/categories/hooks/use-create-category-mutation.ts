'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { categoriesApi } from '../api/categories.api';
import { categoriesKeys } from '../api/categories.query-keys';
import type { ApiError } from '@/core/api/http-error';

/** No success toast — callers (e.g. the product form's inline "+") select the
 * new item right away, which is feedback enough. */
export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
