'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { registersApi, type DenominationsInput } from '../api/registers.api';
import { registersKeys } from '../api/registers.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useOpenRegisterMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('registers');

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DenominationsInput }) => registersApi.open(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: registersKeys.lists() });
      toast.success(t('opened'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
