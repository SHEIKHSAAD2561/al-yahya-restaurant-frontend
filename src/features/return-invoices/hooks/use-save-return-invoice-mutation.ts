'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { returnInvoicesApi, type ReturnInvoiceInput } from '../api/return-invoices.api';
import { returnInvoicesKeys } from '../api/return-invoices.query-keys';
import { productsKeys } from '@/features/products/api/products.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useSaveReturnInvoiceMutation(id?: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('returnInvoices');

  return useMutation({
    mutationFn: (input: ReturnInvoiceInput) => (id ? returnInvoicesApi.update(id, input) : returnInvoicesApi.create(input)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: returnInvoicesKeys.lists() });
      if (id) void queryClient.invalidateQueries({ queryKey: returnInvoicesKeys.detail(id) });
      toast.success(id ? t('updated') : t('created'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useConfirmReturnInvoiceMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('returnInvoices');

  return useMutation({
    mutationFn: (id: string) => returnInvoicesApi.confirm(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: returnInvoicesKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: returnInvoicesKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      toast.success(t('confirmed'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useDeleteReturnInvoiceMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('returnInvoices');

  return useMutation({
    mutationFn: (id: string) => returnInvoicesApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: returnInvoicesKeys.lists() });
      toast.success(t('deleted'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
