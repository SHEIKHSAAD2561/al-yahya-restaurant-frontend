'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '../api/customers.api';
import { customersKeys } from '../api/customers.query-keys';
import type { ApiError } from '@/core/api/http-error';
import { toast } from 'sonner';

/** POS "Add Customer" modal's inline "+" — no success toast, the caller
 * selects the new customer immediately, which is feedback enough. */
export function useQuickCreateCustomerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, phone }: { name: string; phone: string }) => customersApi.quickCreate(name, phone),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customersKeys.all });
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
