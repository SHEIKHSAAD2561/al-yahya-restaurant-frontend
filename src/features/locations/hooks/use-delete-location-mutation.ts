'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { locationsApi } from '../api/locations.api';
import { locationsKeys } from '../api/locations.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useDeleteLocationMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('settings.locations');

  return useMutation({
    mutationFn: locationsApi.remove,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: locationsKeys.lists() });
      toast.success(t('deleted'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
