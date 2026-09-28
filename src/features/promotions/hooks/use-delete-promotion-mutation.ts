'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { promotionsApi } from '../api/promotions.api';
import { promotionsKeys } from '../api/promotions.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useDeletePromotionMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('promotions');

  return useMutation({
    mutationFn: (id: string) => promotionsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: promotionsKeys.lists() });
      toast.success(t('deleted'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
