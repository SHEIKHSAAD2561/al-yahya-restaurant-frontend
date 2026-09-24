'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { rolesApi } from '../api/roles.api';
import { rolesKeys } from '../api/roles.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useDeleteRoleMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('settings.roles');

  return useMutation({
    mutationFn: rolesApi.remove,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rolesKeys.all });
      toast.success(t('deleted'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
