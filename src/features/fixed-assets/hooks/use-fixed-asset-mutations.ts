'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  fixedAssetsApi,
  type CreateFixedAssetInput,
  type UpdateFixedAssetInput,
} from '../api/fixed-assets.api';
import { fixedAssetsKeys } from '../api/fixed-assets.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useSaveFixedAssetMutation(id?: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('fixedAssets');

  return useMutation({
    mutationFn: (input: CreateFixedAssetInput | UpdateFixedAssetInput) =>
      id ? fixedAssetsApi.update(id, input) : fixedAssetsApi.create(input as CreateFixedAssetInput),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: fixedAssetsKeys.all });
      toast.success(id ? t('updated') : t('created'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useRecordDepreciationMutation(id: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('fixedAssets');

  return useMutation({
    mutationFn: (input: { periodDate: string; amount?: number }) => fixedAssetsApi.recordDepreciation(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: fixedAssetsKeys.all });
      toast.success(t('depreciationRecorded'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useDisposeFixedAssetMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('fixedAssets');

  return useMutation({
    mutationFn: ({ id, disposalDate }: { id: string; disposalDate: string }) => fixedAssetsApi.dispose(id, disposalDate),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: fixedAssetsKeys.all });
      toast.success(t('disposed'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

export function useDeleteFixedAssetMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('fixedAssets');

  return useMutation({
    mutationFn: (id: string) => fixedAssetsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: fixedAssetsKeys.lists() });
      toast.success(t('deleted'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
