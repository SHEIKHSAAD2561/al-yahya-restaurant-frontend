'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { taxesApi } from '../api/taxes.api';
import { taxesKeys } from '../api/taxes.query-keys';
import type { UpdateTaxInput } from '../api/taxes.api';
import type { ApiError } from '@/core/api/http-error';

export function useUpdateTaxMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('settings.taxes');

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaxInput }) => taxesApi.update(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taxesKeys.all });
      toast.success(t('updated'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
