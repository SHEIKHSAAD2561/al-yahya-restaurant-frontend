import { backendFetch } from '@/core/api/backend-fetch-client';
import type { StockTransfer, StockTransferListPage, StockTransferStatus } from '../types/stock-transfer';

export interface StockTransfersQuery {
  fromLocationId?: string;
  toLocationId?: string;
  status?: StockTransferStatus;
  page?: number;
  pageSize?: number;
}

export interface StockTransferLineInput {
  variantId: string;
  quantity: number;
}

export interface StockTransferInput {
  fromLocationId: string;
  toLocationId: string;
  notes?: string;
  lines: StockTransferLineInput[];
}

export const stockTransfersApi = {
  list: (query: StockTransfersQuery = {}) =>
    backendFetch<StockTransferListPage>('stock-transfers', {
      searchParams: {
        fromLocationId: query.fromLocationId,
        toLocationId: query.toLocationId,
        status: query.status,
        page: query.page?.toString(),
        pageSize: query.pageSize?.toString(),
      },
    }),
  get: (id: string) => backendFetch<StockTransfer>(`stock-transfers/${id}`),
  create: (input: StockTransferInput) => backendFetch<StockTransfer>('stock-transfers', { method: 'POST', body: input }),
  cancel: (id: string) => backendFetch<StockTransfer>(`stock-transfers/${id}/cancel`, { method: 'POST' }),
  approve: (id: string) => backendFetch<StockTransfer>(`stock-transfers/${id}/approve`, { method: 'POST' }),
  reject: (id: string) => backendFetch<StockTransfer>(`stock-transfers/${id}/reject`, { method: 'POST' }),
};
