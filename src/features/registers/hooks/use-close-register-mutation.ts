'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { registersApi, type CloseRegisterInput } from '../api/registers.api';
import { registersKeys } from '../api/registers.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useCloseRegisterMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('registers');

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CloseRegisterInput }) => registersApi.close(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: registersKeys.lists() });
      toast.success(t('closed'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
