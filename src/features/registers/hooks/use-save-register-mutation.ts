'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { registersApi, type CreateRegisterInput, type UpdateRegisterInput } from '../api/registers.api';
import { registersKeys } from '../api/registers.query-keys';
import type { ApiError } from '@/core/api/http-error';

type SaveVariables = { id: string; input: UpdateRegisterInput } | { id?: undefined; input: CreateRegisterInput };

function isUpdate(variables: SaveVariables): variables is { id: string; input: UpdateRegisterInput } {
  return variables.id !== undefined;
}

export function useSaveRegisterMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('registers');

  return useMutation({
    mutationFn: (variables: SaveVariables) => {
      if (isUpdate(variables)) return registersApi.update(variables.id, variables.input);
      return registersApi.create(variables.input);
    },
    onSuccess: (_register, variables) => {
      void queryClient.invalidateQueries({ queryKey: registersKeys.lists() });
      toast.success(t(variables.id ? 'updated' : 'created'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
