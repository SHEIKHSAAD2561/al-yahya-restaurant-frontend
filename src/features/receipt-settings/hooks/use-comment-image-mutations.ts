'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { receiptSettingsApi } from '../api/receipt-settings.api';
import { receiptSettingsKeys } from '../api/receipt-settings.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useUploadCommentImageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: receiptSettingsApi.uploadCommentImage,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: receiptSettingsKeys.all }),
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useRemoveCommentImageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: receiptSettingsApi.removeCommentImage,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: receiptSettingsKeys.all }),
    onError: (error: ApiError) => toast.error(error.message),
  });
}
