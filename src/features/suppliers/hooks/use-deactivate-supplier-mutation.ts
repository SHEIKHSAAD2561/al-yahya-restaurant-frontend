'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { suppliersApi } from '../api/suppliers.api';
import { suppliersKeys } from '../api/suppliers.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useDeactivateSupplierMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('suppliers');

  return useMutation({
    mutationFn: (id: string) => suppliersApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: suppliersKeys.lists() });
      toast.success(t('deactivated'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
