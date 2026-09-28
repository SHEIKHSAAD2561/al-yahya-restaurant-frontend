import { backendFetch } from '@/core/api/backend-fetch-client';
import type { CustomerPaymentListItem, CustomerPaymentListPage } from '../types/customer-payment';

export interface CustomerPaymentsQuery {
  customerId?: string;
  page?: number;
  pageSize?: number;
}

export interface CustomerPaymentInput {
  customerId: string;
  amount: number;
  paymentMethodId?: string | null;
  paymentDate: string;
  notes?: string;
}

export const customerPaymentsApi = {
  list: (query: CustomerPaymentsQuery = {}) =>
    backendFetch<CustomerPaymentListPage>('customer-payments', {
      searchParams: {
        customerId: query.customerId,
        page: query.page?.toString(),
        pageSize: query.pageSize?.toString(),
      },
    }),
  create: (input: CustomerPaymentInput) =>
    backendFetch<CustomerPaymentListItem>('customer-payments', { method: 'POST', body: input }),
  remove: (id: string) => backendFetch<void>(`customer-payments/${id}`, { method: 'DELETE' }),
};
