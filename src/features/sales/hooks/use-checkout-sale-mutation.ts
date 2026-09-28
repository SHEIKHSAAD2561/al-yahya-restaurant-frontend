'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salesApi } from '../api/sales.api';
import { salesKeys } from '../api/sales.query-keys';
import { productsKeys } from '@/features/products/api/products.query-keys';
import { customersKeys } from '@/features/customers/api/customers.query-keys';
import type { ApiError } from '@/core/api/http-error';
import { toast } from 'sonner';

export function useCheckoutSaleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: salesApi.checkout,
    onSuccess: (_sale, variables) => {
      void queryClient.invalidateQueries({ queryKey: salesKeys.parked(variables.registerId) });
      void queryClient.invalidateQueries({ queryKey: salesKeys.lists() });
      // Stock moved — the product grid's quantities are now stale.
      void queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      // A "Pay Later" checkout changes the customer's derived balance.
      if (variables.isPostPayment) {
        void queryClient.invalidateQueries({ queryKey: customersKeys.all });
      }
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
