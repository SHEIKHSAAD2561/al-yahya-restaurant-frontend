'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { locationsApi, type UpdateLocationInput } from '../api/locations.api';
import { locationsKeys } from '../api/locations.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useUpdateLocationMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('settings.locations');

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLocationInput }) =>
      locationsApi.update(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: locationsKeys.lists() });
      toast.success(t('updated'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
