import type { ReturnInvoicesQuery } from './return-invoices.api';

export const returnInvoicesKeys = {
  all: ['return-invoices'] as const,
  lists: () => [...returnInvoicesKeys.all, 'list'] as const,
  list: (query: ReturnInvoicesQuery) => [...returnInvoicesKeys.lists(), query] as const,
  details: () => [...returnInvoicesKeys.all, 'detail'] as const,
  detail: (id: string) => [...returnInvoicesKeys.details(), id] as const,
};
