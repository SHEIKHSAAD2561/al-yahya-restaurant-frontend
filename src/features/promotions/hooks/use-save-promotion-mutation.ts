'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { promotionsApi, type PromotionInput } from '../api/promotions.api';
import { promotionsKeys } from '../api/promotions.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useSavePromotionMutation(id?: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('promotions');

  return useMutation({
    mutationFn: (input: PromotionInput) => (id ? promotionsApi.update(id, input) : promotionsApi.create(input)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: promotionsKeys.lists() });
      if (id) void queryClient.invalidateQueries({ queryKey: promotionsKeys.detail(id) });
      toast.success(id ? t('updated') : t('created'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
