'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { usersApi } from '../api/users.api';
import { usersKeys } from '../api/users.query-keys';
import type { UserStatus } from '../types/user';
import type { ApiError } from '@/core/api/http-error';

export function useUpdateUserStatusMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('settings.users');

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      usersApi.updateStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success(t('statusUpdated'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
