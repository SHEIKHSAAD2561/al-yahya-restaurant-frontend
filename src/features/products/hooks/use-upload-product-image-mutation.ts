'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productsApi } from '../api/products.api';
import type { ApiError } from '@/core/api/http-error';

export function useUploadProductImageMutation() {
  return useMutation({
    mutationFn: productsApi.uploadImage,
    onError: (error: ApiError) => toast.error(error.message),
  });
}
