'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { receiptSettingsApi } from '../api/receipt-settings.api';
import { receiptSettingsKeys } from '../api/receipt-settings.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useUpdateReceiptSettingsMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('saleSettings');

  return useMutation({
    mutationFn: receiptSettingsApi.update,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: receiptSettingsKeys.all });
      toast.success(t('updated'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
