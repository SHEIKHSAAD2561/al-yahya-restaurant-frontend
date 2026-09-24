import { backendFetch } from '@/core/api/backend-fetch-client';
import type { Tax } from '../types/tax';

export interface TaxLineInput {
  label?: string;
  rate: number;
}

export interface CreateTaxInput {
  name: string;
  code: string;
  hasCompoundTax?: boolean;
  lines: TaxLineInput[];
  compoundLabel?: string;
  compoundRate?: number;
}

export type UpdateTaxInput = Partial<CreateTaxInput>;

export const taxesApi = {
  list: () => backendFetch<Tax[]>('taxes'),
  get: (id: string) => backendFetch<Tax>(`taxes/${id}`),
  create: (input: CreateTaxInput) => backendFetch<Tax>('taxes', { method: 'POST', body: input }),
  update: (id: string, input: UpdateTaxInput) =>
    backendFetch<Tax>(`taxes/${id}`, { method: 'PATCH', body: input }),
  updateStatus: (id: string, isActive: boolean) =>
    backendFetch<Tax>(`taxes/${id}/status`, { method: 'PATCH', body: { isActive } }),
};
