'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { downloadBlob } from '@/lib/download-blob';
import { customersApi, type CustomersQuery } from '../api/customers.api';
import type { ApiError } from '@/core/api/http-error';

export function useExportCustomersMutation() {
  return useMutation({
    mutationFn: async (query: CustomersQuery) => downloadBlob(await customersApi.exportCsv(query), 'customers.csv'),
    onError: (error: ApiError) => toast.error(error.message),
  });
}
