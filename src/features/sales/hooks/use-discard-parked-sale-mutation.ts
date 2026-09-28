'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { salesApi } from '../api/sales.api';
import { salesKeys } from '../api/sales.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useDiscardParkedSaleMutation(registerId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('sellScreen');

  return useMutation({
    mutationFn: salesApi.discardParked,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: salesKeys.parked(registerId) });
      toast.success(t('saleDiscarded'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
