'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import { productsKeys } from '../api/products.query-keys';
import type { ApiError } from '@/core/api/http-error';
import { toast } from 'sonner';

/** No success/error toast here — the dialog shows a per-row result table,
 * which is the real feedback for an import. */
export function useImportProductsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsApi.importCsv,
    onSuccess: (result) => {
      if (result.imported > 0) {
        void queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      }
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
