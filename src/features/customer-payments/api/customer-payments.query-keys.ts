import type { CustomerPaymentsQuery } from './customer-payments.api';

export const customerPaymentsKeys = {
  all: ['customer-payments'] as const,
  lists: () => [...customerPaymentsKeys.all, 'list'] as const,
  list: (query: CustomerPaymentsQuery) => [...customerPaymentsKeys.lists(), query] as const,
};
