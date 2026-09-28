import type { AccountsQuery } from './accounts.api';

export const accountsKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountsKeys.all, 'list'] as const,
  list: (query: AccountsQuery) => [...accountsKeys.lists(), query] as const,
  details: () => [...accountsKeys.all, 'detail'] as const,
  detail: (id: string) => [...accountsKeys.details(), id] as const,
};
