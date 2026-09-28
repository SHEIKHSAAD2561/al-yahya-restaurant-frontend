import { backendFetch } from '@/core/api/backend-fetch-client';
import type { Brand } from '../types/brand';

export const brandsApi = {
  list: () => backendFetch<Brand[]>('brands'),
  create: (name: string) => backendFetch<Brand>('brands', { method: 'POST', body: { name } }),
};
