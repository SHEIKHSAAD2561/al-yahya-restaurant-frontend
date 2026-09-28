'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { bankAccountsApi } from '../api/payment-methods.api';
import { bankAccountsKeys } from '../api/payment-methods.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useCreateBankAccountMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('settings.paymentMethods');

  return useMutation({
    mutationFn: bankAccountsApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bankAccountsKeys.lists() });
      toast.success(t('bankCreated'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
