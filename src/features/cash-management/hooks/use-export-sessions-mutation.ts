'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { downloadBlob } from '@/lib/download-blob';
import { cashManagementApi, type SessionsQuery } from '../api/cash-management.api';
import type { ApiError } from '@/core/api/http-error';

export function useExportSessionsMutation() {
  return useMutation({
    mutationFn: async (query: SessionsQuery) =>
      downloadBlob(await cashManagementApi.exportCsv(query), 'cash-management.csv'),
    onError: (error: ApiError) => toast.error(error.message),
  });
}
