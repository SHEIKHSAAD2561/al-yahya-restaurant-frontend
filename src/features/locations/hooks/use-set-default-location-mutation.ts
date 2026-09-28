'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { locationsApi } from '../api/locations.api';
import { locationsKeys } from '../api/locations.query-keys';
import { configurationKeys } from '@/features/configuration/api/configuration.query-keys';
import type { ApiError } from '@/core/api/http-error';
import { toast } from 'sonner';

export function useSetDefaultLocationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: locationsApi.setDefault,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: locationsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: configurationKeys.all });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
