'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { promotionsApi } from '../api/promotions.api';
import { promotionsKeys } from '../api/promotions.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useUpdatePromotionStatusMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('promotions');

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => promotionsApi.updateStatus(id, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: promotionsKeys.lists() });
      toast.success(t('updated'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
