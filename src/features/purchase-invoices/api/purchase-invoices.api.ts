import { backendFetch } from '@/core/api/backend-fetch-client';
import type { PurchaseInvoice, PurchaseInvoiceListPage, PurchaseInvoiceStatus } from '../types/purchase-invoice';

export interface PurchaseInvoicesQuery {
  supplierId?: string;
  locationId?: string;
  status?: PurchaseInvoiceStatus;
  page?: number;
  pageSize?: number;
}

export interface PurchaseInvoiceLineInput {
  variantId: string;
  quantity: number;
  unitCost: number;
  taxId?: string | null;
}

export interface PurchaseInvoiceInput {
  supplierId: string;
  locationId: string;
  invoiceDate: string;
  notes?: string;
  status?: PurchaseInvoiceStatus;
  lines: PurchaseInvoiceLineInput[];
}

export const purchaseInvoicesApi = {
  list: (query: PurchaseInvoicesQuery = {}) =>
    backendFetch<PurchaseInvoiceListPage>('purchase-invoices', {
      searchParams: {
        supplierId: query.supplierId,
        locationId: query.locationId,
        status: query.status,
        page: query.page?.toString(),
        pageSize: query.pageSize?.toString(),
      },
    }),
  get: (id: string) => backendFetch<PurchaseInvoice>(`purchase-invoices/${id}`),
  create: (input: PurchaseInvoiceInput) =>
    backendFetch<PurchaseInvoice>('purchase-invoices', { method: 'POST', body: input }),
  update: (id: string, input: Partial<PurchaseInvoiceInput>) =>
    backendFetch<PurchaseInvoice>(`purchase-invoices/${id}`, { method: 'PATCH', body: input }),
  confirm: (id: string) => backendFetch<PurchaseInvoice>(`purchase-invoices/${id}/confirm`, { method: 'POST' }),
  remove: (id: string) => backendFetch<void>(`purchase-invoices/${id}`, { method: 'DELETE' }),
};
