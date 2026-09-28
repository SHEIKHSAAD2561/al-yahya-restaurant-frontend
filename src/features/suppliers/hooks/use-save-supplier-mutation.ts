'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { suppliersApi, type SupplierInput } from '../api/suppliers.api';
import { suppliersKeys } from '../api/suppliers.query-keys';
import type { ApiError } from '@/core/api/http-error';

export function useSaveSupplierMutation(id?: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('suppliers');

  return useMutation({
    mutationFn: (input: SupplierInput) => (id ? suppliersApi.update(id, input) : suppliersApi.create(input)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: suppliersKeys.lists() });
      toast.success(id ? t('updated') : t('created'));
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}
