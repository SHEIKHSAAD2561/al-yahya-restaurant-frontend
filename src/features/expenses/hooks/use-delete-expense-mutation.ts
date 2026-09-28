'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { expensesApi } from '../api/expenses.api';
import { expensesKeys } from '../api/expenses.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useDeleteExpenseMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('expenses');

  return useMutation({
    mutationFn: (id: string) => expensesApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: expensesKeys.lists() });
      toast.success(t('deleted'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
