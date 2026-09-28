'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { supplierPaymentsApi, type SupplierPaymentsQuery } from '../api/supplier-payments.api';
import { supplierPaymentsKeys } from '../api/supplier-payments.query-keys';

export function useSupplierPaymentsQuery(query: SupplierPaymentsQuery) {
  return useQuery({
    queryKey: supplierPaymentsKeys.list(query),
    queryFn: () => supplierPaymentsApi.list(query),
    placeholderData: keepPreviousData,
  });
}
