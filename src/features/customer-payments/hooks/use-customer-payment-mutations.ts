'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { customerPaymentsApi, type CustomerPaymentInput } from '../api/customer-payments.api';
import { customerPaymentsKeys } from '../api/customer-payments.query-keys';
import { customersKeys } from '@/features/customers/api/customers.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useCreateCustomerPaymentMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('customerPayments');

  return useMutation({
    mutationFn: (input: CustomerPaymentInput) => customerPaymentsApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerPaymentsKeys.lists() });
      // A new payment changes the customer's derived balance (list, detail, and the summary card).
      void queryClient.invalidateQueries({ queryKey: customersKeys.all });
      toast.success(t('created'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useDeleteCustomerPaymentMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('customerPayments');

  return useMutation({
    mutationFn: (id: string) => customerPaymentsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerPaymentsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: customersKeys.all });
      toast.success(t('deleted'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
