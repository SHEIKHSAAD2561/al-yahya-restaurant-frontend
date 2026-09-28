import { backendFetch } from '@/core/api/backend-fetch-client';
import type { StockMovement, StockMovementListPage, StockMovementStatus, StockMovementType } from '../types/stock-movement';

export interface StockMovementsQuery {
  locationId?: string;
  type?: StockMovementType;
  status?: StockMovementStatus;
  page?: number;
  pageSize?: number;
}

export interface StockMovementLineInput {
  variantId: string;
  quantity: number;
}

export interface StockMovementInput {
  type: StockMovementType;
  locationId: string;
  reason: string;
  movementDate: string;
  status?: StockMovementStatus;
  lines: StockMovementLineInput[];
}

export const stockMovementsApi = {
  list: (query: StockMovementsQuery = {}) =>
    backendFetch<StockMovementListPage>('stock-operations', {
      searchParams: {
        locationId: query.locationId,
        type: query.type,
        status: query.status,
        page: query.page?.toString(),
        pageSize: query.pageSize?.toString(),
      },
    }),
  get: (id: string) => backendFetch<StockMovement>(`stock-operations/${id}`),
  create: (input: StockMovementInput) => backendFetch<StockMovement>('stock-operations', { method: 'POST', body: input }),
  update: (id: string, input: Partial<StockMovementInput>) =>
    backendFetch<StockMovement>(`stock-operations/${id}`, { method: 'PATCH', body: input }),
  confirm: (id: string) => backendFetch<StockMovement>(`stock-operations/${id}/confirm`, { method: 'POST' }),
  remove: (id: string) => backendFetch<void>(`stock-operations/${id}`, { method: 'DELETE' }),
};
