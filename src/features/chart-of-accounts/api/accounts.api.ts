import { backendFetch } from '@/core/api/backend-fetch-client';
import type { Account, AccountType } from '../types/account';

export interface AccountsQuery {
  type?: AccountType;
  search?: string;
}

export interface AccountInput {
  code: string;
  name: string;
  type: AccountType;
  parentId?: string | null;
}

export const accountsApi = {
  list: (query: AccountsQuery = {}) =>
    backendFetch<Account[]>('accounts', { searchParams: { type: query.type, search: query.search || undefined } }),
  get: (id: string) => backendFetch<Account>(`accounts/${id}`),
  create: (input: AccountInput) => backendFetch<Account>('accounts', { method: 'POST', body: input }),
  update: (id: string, input: Partial<AccountInput> & { isActive?: boolean }) =>
    backendFetch<Account>(`accounts/${id}`, { method: 'PATCH', body: input }),
  remove: (id: string) => backendFetch<void>(`accounts/${id}`, { method: 'DELETE' }),
};
