import type { CustomersQuery } from './customers.api';

export const customersKeys = {
  all: ['customers'] as const,
  lists: () => [...customersKeys.all, 'list'] as const,
  list: (query: CustomersQuery) => [...customersKeys.lists(), query] as const,
  details: () => [...customersKeys.all, 'detail'] as const,
  detail: (id: string) => [...customersKeys.details(), id] as const,
  search: (term: string) => [...customersKeys.all, 'search', term] as const,
};
