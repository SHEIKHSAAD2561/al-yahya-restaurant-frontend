'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { companyApi } from '../api/company.api';
import { companyKeys } from '../api/company.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useUploadLogoMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('settings.company');

  return useMutation({
    mutationFn: companyApi.uploadLogo,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: companyKeys.all });
      toast.success(t('logoUpdated'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
