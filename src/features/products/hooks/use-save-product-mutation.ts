'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { productsApi, type ProductInput } from '../api/products.api';
import { productsKeys } from '../api/products.query-keys';
import type { Product, ProductType } from '../types/product';
import type { ApiError } from '@/core/api/http-error';

type SaveProductVariables =
  | { id: string; input: ProductInput }
  | { id?: undefined; input: ProductInput & { type: ProductType } };

/** Create when there's no `id`, update otherwise — one form drives both. */
export function useSaveProductMutation() {
  const queryClient = useQueryClient();
  const t = useTranslations('products');

  return useMutation<Product, ApiError, SaveProductVariables>({
    mutationFn: (variables) =>
      variables.id
        ? productsApi.update(variables.id, variables.input)
        : productsApi.create(variables.input as ProductInput & { type: ProductType }),
    onSuccess: (product, variables) => {
      void queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      queryClient.setQueryData(productsKeys.detail(product.id), product);
      toast.success(t(variables.id ? 'updated' : 'created'));
    },
    onError: (error) => toast.error(error.message),
  });
}
