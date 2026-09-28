'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { purchaseInvoicesApi, type PurchaseInvoiceInput } from '../api/purchase-invoices.api';
import { purchaseInvoicesKeys } from '../api/purchase-invoices.query-keys';
import { productsKeys } from '@/features/products/api/products.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useSavePurchaseInvoiceMutation(id?: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('purchaseInvoices');

  return useMutation({
    mutationFn: (input: PurchaseInvoiceInput) =>
      id ? purchaseInvoicesApi.update(id, input) : purchaseInvoicesApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: purchaseInvoicesKeys.lists() });
      if (id) void queryClient.invalidateQueries({ queryKey: purchaseInvoicesKeys.detail(id) });
      toast.success(id ? t('updated') : t('created'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useConfirmPurchaseInvoiceMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('purchaseInvoices');

  return useMutation({
    mutationFn: (id: string) => purchaseInvoicesApi.confirm(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: purchaseInvoicesKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: purchaseInvoicesKeys.detail(id) });
      // Confirming moves stock and cost — the product grid/list is now stale.
      void queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      toast.success(t('confirmed'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useDeletePurchaseInvoiceMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('purchaseInvoices');

  return useMutation({
    mutationFn: (id: string) => purchaseInvoicesApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: purchaseInvoicesKeys.lists() });
      toast.success(t('deleted'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
