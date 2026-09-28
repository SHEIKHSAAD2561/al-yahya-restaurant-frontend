'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { supplierPaymentsApi, type SupplierPaymentInput } from '../api/supplier-payments.api';
import { supplierPaymentsKeys } from '../api/supplier-payments.query-keys';
import { suppliersKeys } from '@/features/suppliers/api/suppliers.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useCreateSupplierPaymentMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('supplierPayments');

  return useMutation({
    mutationFn: (input: SupplierPaymentInput) => supplierPaymentsApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: supplierPaymentsKeys.lists() });
      // A new payment changes the supplier's derived balance.
      void queryClient.invalidateQueries({ queryKey: suppliersKeys.lists() });
      toast.success(t('created'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useDeleteSupplierPaymentMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('supplierPayments');

  return useMutation({
    mutationFn: (id: string) => supplierPaymentsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: supplierPaymentsKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: suppliersKeys.lists() });
      toast.success(t('deleted'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
