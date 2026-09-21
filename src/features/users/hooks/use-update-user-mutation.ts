'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { usersApi, type UpdateUserPayload } from '../api/users.api';
import { usersKeys } from '../api/users.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('settings.users');

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      usersApi.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success(t('updated'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
