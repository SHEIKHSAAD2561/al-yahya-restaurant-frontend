'use client';

import { useQuery } from '@tanstack/react-query';
import { paymentMethodsApi } from '../api/payment-methods.api';
import { paymentMethodsKeys } from '../api/payment-methods.query-keys';

export function usePaymentMethodsQuery() {
  return useQuery({
    queryKey: paymentMethodsKeys.lists(),
    queryFn: paymentMethodsApi.list,
  });
}
