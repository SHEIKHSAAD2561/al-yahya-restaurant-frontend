import { backendFetch } from '@/core/api/backend-fetch-client';
import type { SupplierPaymentListItem, SupplierPaymentListPage } from '../types/supplier-payment';

export interface SupplierPaymentsQuery {
  supplierId?: string;
  page?: number;
  pageSize?: number;
}

export interface SupplierPaymentInput {
  supplierId: string;
  amount: number;
  paymentMethodId?: string | null;
  paymentDate: string;
  notes?: string;
}

export const supplierPaymentsApi = {
  list: (query: SupplierPaymentsQuery = {}) =>
    backendFetch<SupplierPaymentListPage>('supplier-payments', {
      searchParams: {
        supplierId: query.supplierId,
        page: query.page?.toString(),
        pageSize: query.pageSize?.toString(),
      },
    }),
  create: (input: SupplierPaymentInput) =>
    backendFetch<SupplierPaymentListItem>('supplier-payments', { method: 'POST', body: input }),
  remove: (id: string) => backendFetch<void>(`supplier-payments/${id}`, { method: 'DELETE' }),
};
