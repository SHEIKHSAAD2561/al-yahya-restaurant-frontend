import type { SupplierPaymentsQuery } from './supplier-payments.api';

export const supplierPaymentsKeys = {
  all: ['supplier-payments'] as const,
  lists: () => [...supplierPaymentsKeys.all, 'list'] as const,
  list: (query: SupplierPaymentsQuery) => [...supplierPaymentsKeys.lists(), query] as const,
};
