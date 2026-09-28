'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { accountsApi, type AccountInput } from '../api/accounts.api';
import { accountsKeys } from '../api/accounts.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useSaveAccountMutation(id?: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('chartOfAccounts');

  return useMutation({
    mutationFn: (input: AccountInput) => (id ? accountsApi.update(id, input) : accountsApi.create(input)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountsKeys.all });
      toast.success(id ? t('updated') : t('created'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useToggleAccountStatusMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('chartOfAccounts');

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => accountsApi.update(id, { isActive }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountsKeys.all });
      toast.success(t('updated'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('chartOfAccounts');

  return useMutation({
    mutationFn: (id: string) => accountsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountsKeys.all });
      toast.success(t('deleted'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
