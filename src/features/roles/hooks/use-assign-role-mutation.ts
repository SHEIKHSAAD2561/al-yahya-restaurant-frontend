'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { usersApi } from '@/features/users/api/users.api';
import { usersKeys } from '@/features/users/api/users.query-keys';
import type { ApiError } from '@/core/api/http-error';

/** No bulk-assign endpoint exists on the backend, so this fires one
 * `PATCH /users/:id` per selected user — same endpoint the Edit User drawer
 * already uses, just called several times. */
export function useAssignRoleMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('settings.roles');

  return useMutation({
    mutationFn: ({ userIds, roleId }: { userIds: string[]; roleId: string }) =>
      Promise.all(userIds.map((id) => usersApi.update(id, { roleId }))),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.all });
      toast.success(t('usersAssigned'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
