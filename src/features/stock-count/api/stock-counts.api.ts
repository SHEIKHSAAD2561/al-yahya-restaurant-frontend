import { backendFetch } from '@/core/api/backend-fetch-client';
import type { StockCount, StockCountListPage, StockCountStatus } from '../types/stock-count';

export interface StockCountsQuery {
  locationId?: string;
  status?: StockCountStatus;
  page?: number;
  pageSize?: number;
}

export interface CreateStockCountInput {
  locationId: string;
  countDate: string;
}

export interface StockCountLineUpdateInput {
  id: string;
  countedQuantity: number;
}

export const stockCountsApi = {
  list: (query: StockCountsQuery = {}) =>
    backendFetch<StockCountListPage>('stock-count', {
      searchParams: {
        locationId: query.locationId,
        status: query.status,
        page: query.page?.toString(),
        pageSize: query.pageSize?.toString(),
      },
    }),
  get: (id: string) => backendFetch<StockCount>(`stock-count/${id}`),
  create: (input: CreateStockCountInput) => backendFetch<StockCount>('stock-count', { method: 'POST', body: input }),
  updateLines: (id: string, lines: StockCountLineUpdateInput[]) =>
    backendFetch<StockCount>(`stock-count/${id}/lines`, { method: 'PATCH', body: { lines } }),
  confirm: (id: string) => backendFetch<StockCount>(`stock-count/${id}/confirm`, { method: 'POST' }),
  remove: (id: string) => backendFetch<void>(`stock-count/${id}`, { method: 'DELETE' }),
};
