import { backendFetch } from '@/core/api/backend-fetch-client';
import type { Supplier, SupplierDetail } from '../types/supplier';

export interface SupplierInput {
  name: string;
  phone?: string;
  email?: string;
  vatNumber?: string;
  address?: string;
  notes?: string;
  isActive?: boolean;
}

export const suppliersApi = {
  list: () => backendFetch<Supplier[]>('suppliers'),
  get: (id: string) => backendFetch<SupplierDetail>(`suppliers/${id}`),
  create: (input: SupplierInput) => backendFetch<SupplierDetail>('suppliers', { method: 'POST', body: input }),
  update: (id: string, input: Partial<SupplierInput>) =>
    backendFetch<SupplierDetail>(`suppliers/${id}`, { method: 'PATCH', body: input }),
  remove: (id: string) => backendFetch<void>(`suppliers/${id}`, { method: 'DELETE' }),
};
