import type { ProductsQuery } from './products.api';

export const productsKeys = {
  all: ['products'] as const,
  lists: () => [...productsKeys.all, 'list'] as const,
  list: (query: ProductsQuery) => [...productsKeys.lists(), query] as const,
  details: () => [...productsKeys.all, 'detail'] as const,
  detail: (id: string) => [...productsKeys.details(), id] as const,
  formOptions: () => [...productsKeys.all, 'form-options'] as const,
};
