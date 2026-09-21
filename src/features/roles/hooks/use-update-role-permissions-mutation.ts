'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { rolesApi } from '../api/roles.api';
import { rolesKeys } from '../api/roles.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useUpdateRolePermissionsMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('settings.roles');

  return useMutation({
    mutationFn: ({ id, permissionCodes }: { id: string; permissionCodes: string[] }) =>
      rolesApi.updatePermissions(id, { permissionCodes }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rolesKeys.lists() });
      toast.success(t('permissionsUpdated'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
