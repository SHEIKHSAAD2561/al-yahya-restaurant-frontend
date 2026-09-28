'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { customersApi, type CustomerInput } from '../api/customers.api';
import { customersKeys } from '../api/customers.query-keys';
import type { ApiError } from '@/core/api/http-error';

type SaveVariables = { id: string; input: Partial<CustomerInput> } | { id?: undefined; input: CustomerInput };

function isUpdate(variables: SaveVariables): variables is { id: string; input: Partial<CustomerInput> } {
  return variables.id !== undefined;
}

export function useSaveCustomerMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('customers');

  return useMutation({
    mutationFn: (variables: SaveVariables) => {
      if (isUpdate(variables)) return customersApi.update(variables.id, variables.input);
      return customersApi.create(variables.input);
    },
    onSuccess: (customer, variables) => {
      void queryClient.invalidateQueries({ queryKey: customersKeys.lists() });
      queryClient.setQueryData(customersKeys.detail(customer.id), customer);
      toast.success(t(variables.id ? 'updated' : 'created'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
