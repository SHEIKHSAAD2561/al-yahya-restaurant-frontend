'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { taxesApi } from '../api/taxes.api';
import { taxesKeys } from '../api/taxes.query-keys';
import { configurationKeys } from '@/features/configuration/api/configuration.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useUpdateTaxStatusMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('settings.taxes');

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      taxesApi.updateStatus(id, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taxesKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: configurationKeys.all });
      toast.success(t('statusUpdated'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
