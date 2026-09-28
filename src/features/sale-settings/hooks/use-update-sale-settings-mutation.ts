'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { saleSettingsApi } from '../api/sale-settings.api';
import { saleSettingsKeys } from '../api/sale-settings.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useUpdateSaleSettingsMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('saleSettings');

  return useMutation({
    mutationFn: saleSettingsApi.update,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: saleSettingsKeys.all });
      toast.success(t('updated'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
