'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { customerPaymentsApi, type CustomerPaymentsQuery } from '../api/customer-payments.api';
import { customerPaymentsKeys } from '../api/customer-payments.query-keys';

export function useCustomerPaymentsQuery(query: CustomerPaymentsQuery) {
  return useQuery({
    queryKey: customerPaymentsKeys.list(query),
    queryFn: () => customerPaymentsApi.list(query),
    placeholderData: keepPreviousData,
  });
}
