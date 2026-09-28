'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { configurationKeys } from '../api/configuration.query-keys';
import { locationsKeys } from '@/features/locations/api/locations.query-keys';
import type { Configuration } from '../types/configuration';
import type { ApiError } from '@/core/api/http-error';

/** Shared by every card — pass the section's own `configurationApi.updateX`. */
export function useUpdateConfigurationMutation<TInput>(
  mutationFn: (input: TInput) => Promise<Configuration>,
) {
  const queryClient = useQueryClient();
  const t = useTranslations('settings.configuration');

  return useMutation({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: configurationKeys.all });
      // The Location card moves `Location.isDefault`, which the Locations tab shows.
      void queryClient.invalidateQueries({ queryKey: locationsKeys.lists() });
      toast.success(t('updated'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
