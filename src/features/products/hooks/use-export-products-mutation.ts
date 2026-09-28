'use client';

import { useMutation } from '@tanstack/react-query';
import { downloadBlob } from '@/lib/download-blob';
import { productsApi } from '../api/products.api';
import type { ProductsQuery } from '../api/products.api';
import type { ApiError } from '@/core/api/http-error';
import { toast } from 'sonner';

/** Downloads a CSV of the current (filtered) products list. */
export function useExportProductsMutation() {
  return useMutation({
    mutationFn: async (query: ProductsQuery) => {
      const blob = await productsApi.exportCsv(query);
      downloadBlob(blob, 'products.csv');
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
