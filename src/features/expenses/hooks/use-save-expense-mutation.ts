'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { expensesApi, type ExpenseInput } from '../api/expenses.api';
import { expensesKeys } from '../api/expenses.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useSaveExpenseMutation(id?: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('expenses');

  return useMutation({
    mutationFn: (input: ExpenseInput) => (id ? expensesApi.update(id, input) : expensesApi.create(input)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: expensesKeys.lists() });
      toast.success(id ? t('updated') : t('created'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
