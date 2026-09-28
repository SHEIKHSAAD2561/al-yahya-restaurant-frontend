'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { brandsApi } from '../api/brands.api';
import { brandsKeys } from '../api/brands.query-keys';
import type { ApiError } from '@/core/api/http-error';

/** No success toast — callers (e.g. the product form's inline "+") select the
 * new item right away, which is feedback enough. */
export function useCreateBrandMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: brandsApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: brandsKeys.lists() });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
