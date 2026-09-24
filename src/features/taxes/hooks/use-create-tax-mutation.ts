'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { taxesApi } from '../api/taxes.api';
import { taxesKeys } from '../api/taxes.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useCreateTaxMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('settings.taxes');

  return useMutation({
    mutationFn: taxesApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taxesKeys.lists() });
      toast.success(t('created'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
