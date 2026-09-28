'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salesApi } from '../api/sales.api';
import { salesKeys } from '../api/sales.query-keys';
import type { ApiError } from '@/core/api/http-error';
import { toast } from 'sonner';

export function useParkSaleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: salesApi.park,
    onSuccess: (_sale, variables) => {
      void queryClient.invalidateQueries({ queryKey: salesKeys.parked(variables.registerId) });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
