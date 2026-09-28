import { backendFetch } from '@/core/api/backend-fetch-client';
import type { Category, CategoryTreeNodeInput } from '../types/category';

export interface CreateCategoryInput {
  name: string;
  description?: string | null;
  parentId?: string | null;
  /** "Create category & assign" — assigns these products to the new category
   * in the same call. */
  assignProductIds?: string[];
}

export interface CreateCategoryTreeInput {
  parentName: string;
  children?: CategoryTreeNodeInput[];
}

export const categoriesApi = {
  list: () => backendFetch<Category[]>('categories'),
  uncategorizedCount: () => backendFetch<{ count: number }>('categories/uncategorized-count'),
  /** Plain-name creation — used by the product form's inline "+" (always
   * top-level, no description). */
  create: (name: string) => backendFetch<Category>('categories', { method: 'POST', body: { name } }),
  /** Full creation — used by Category Management's "Individual category" form. */
  createDetailed: (input: CreateCategoryInput) =>
    backendFetch<Category>('categories', { method: 'POST', body: input }),
  createTree: (input: CreateCategoryTreeInput) =>
    backendFetch<Category>('categories/tree', { method: 'POST', body: input }),
  assignProducts: (categoryId: string, productIds: string[]) =>
    backendFetch<{ updated: number }>(`categories/${categoryId}/assign-products`, {
      method: 'PATCH',
      body: { productIds },
    }),
  unassignProducts: (productIds: string[]) =>
    backendFetch<{ updated: number }>('categories/unassign-products', {
      method: 'PATCH',
      body: { productIds },
    }),
};
