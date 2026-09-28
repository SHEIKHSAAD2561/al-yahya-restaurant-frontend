import type { PurchaseInvoicesQuery } from './purchase-invoices.api';

export const purchaseInvoicesKeys = {
  all: ['purchase-invoices'] as const,
  lists: () => [...purchaseInvoicesKeys.all, 'list'] as const,
  list: (query: PurchaseInvoicesQuery) => [...purchaseInvoicesKeys.lists(), query] as const,
  details: () => [...purchaseInvoicesKeys.all, 'detail'] as const,
  detail: (id: string) => [...purchaseInvoicesKeys.details(), id] as const,
};
