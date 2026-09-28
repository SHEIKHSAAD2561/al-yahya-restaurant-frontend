'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { customersApi } from '../api/customers.api';
import { customersKeys } from '../api/customers.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useDeleteCustomerMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('customers');

  return useMutation({
    mutationFn: customersApi.remove,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customersKeys.lists() });
      toast.success(t('deleted'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
