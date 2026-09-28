import { backendFetch } from '@/core/api/backend-fetch-client';
import type { ReturnInvoice, ReturnInvoiceListPage, ReturnInvoiceStatus } from '../types/return-invoice';

export interface ReturnInvoicesQuery {
  supplierId?: string;
  locationId?: string;
  status?: ReturnInvoiceStatus;
  page?: number;
  pageSize?: number;
}

export interface ReturnInvoiceLineInput {
  variantId: string;
  quantity: number;
  unitCost: number;
  taxId?: string | null;
}

export interface ReturnInvoiceInput {
  supplierId: string;
  locationId: string;
  purchaseInvoiceId?: string | null;
  returnDate: string;
  notes?: string;
  status?: ReturnInvoiceStatus;
  lines: ReturnInvoiceLineInput[];
}

export const returnInvoicesApi = {
  list: (query: ReturnInvoicesQuery = {}) =>
    backendFetch<ReturnInvoiceListPage>('return-invoices', {
      searchParams: {
        supplierId: query.supplierId,
        locationId: query.locationId,
        status: query.status,
        page: query.page?.toString(),
        pageSize: query.pageSize?.toString(),
      },
    }),
  get: (id: string) => backendFetch<ReturnInvoice>(`return-invoices/${id}`),
  create: (input: ReturnInvoiceInput) => backendFetch<ReturnInvoice>('return-invoices', { method: 'POST', body: input }),
  update: (id: string, input: Partial<ReturnInvoiceInput>) =>
    backendFetch<ReturnInvoice>(`return-invoices/${id}`, { method: 'PATCH', body: input }),
  confirm: (id: string) => backendFetch<ReturnInvoice>(`return-invoices/${id}/confirm`, { method: 'POST' }),
  remove: (id: string) => backendFetch<void>(`return-invoices/${id}`, { method: 'DELETE' }),
};
