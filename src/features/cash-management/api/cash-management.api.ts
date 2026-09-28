import { backendDownload, backendFetch } from '@/core/api/backend-fetch-client';
import type { CashMovement } from '@/features/registers/types/register';
import type { SessionDetail, SessionListPage, SessionStatus } from '../types/session';

export interface SessionsQuery {
  locationId?: string;
  registerId?: string;
  status?: SessionStatus;
  page?: number;
  pageSize?: number;
}

export const cashManagementApi = {
  listSessions: (query: SessionsQuery = {}) =>
    backendFetch<SessionListPage>('registers/sessions', {
      searchParams: {
        locationId: query.locationId,
        registerId: query.registerId,
        status: query.status,
        page: query.page?.toString(),
        pageSize: query.pageSize?.toString(),
      },
    }),
  getSessionDetail: (id: string) => backendFetch<SessionDetail>(`registers/sessions/${id}`),
  listMovements: (id: string) => backendFetch<CashMovement[]>(`registers/sessions/${id}/movements`),
  exportCsv: (query: SessionsQuery = {}) =>
    backendDownload('registers/sessions/export', {
      locationId: query.locationId,
      registerId: query.registerId,
      status: query.status,
    }),
};
