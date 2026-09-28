'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { downloadBlob } from '@/lib/download-blob';
import { salesApi, type SalesQuery } from '../api/sales.api';
import type { ApiError } from '@/core/api/http-error';

export function useExportSalesMutation() {
  return useMutation({
    mutationFn: async (query: SalesQuery) => downloadBlob(await salesApi.exportCsv(query), 'sale-invoices.csv'),
    onError: (error: ApiError) => toast.error(error.message),
  });
}
