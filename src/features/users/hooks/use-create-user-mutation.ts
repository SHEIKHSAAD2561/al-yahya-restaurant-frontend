'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { usersApi } from '../api/users.api';
import { usersKeys } from '../api/users.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('settings.users');

  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success(t('created'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
