'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { paymentMethodsApi } from '../api/payment-methods.api';
import { paymentMethodsKeys } from '../api/payment-methods.query-keys';
import { configurationKeys } from '@/features/configuration/api/configuration.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useCreatePaymentMethodMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('settings.paymentMethods');

  return useMutation({
    mutationFn: paymentMethodsApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: paymentMethodsKeys.lists() });
      // Configuration's Default Payment Method dropdown lists these by name.
      void queryClient.invalidateQueries({ queryKey: configurationKeys.all });
      toast.success(t('created'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
