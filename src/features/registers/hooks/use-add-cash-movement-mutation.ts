'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { registersApi } from '../api/registers.api';
import { registersKeys } from '../api/registers.query-keys';
import type { CashMovementType } from '../types/register';
import type { ApiError } from '@/core/api/http-error';

export function useAddCashMovementMutation(registerId: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('registers');

  return useMutation({
    mutationFn: (input: { type: CashMovementType; amount: number; reason?: string }) =>
      registersApi.addCashMovement(registerId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: registersKeys.cashMovements(registerId) });
      toast.success(t('cashMovementAdded'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
