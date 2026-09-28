import { backendFetch } from '@/core/api/backend-fetch-client';
import type { Report, ReportPeriod } from '../types/report';

export interface ReportsQuery {
  days?: ReportPeriod;
  locationId?: string;
}

export const reportsApi = {
  get: (query: ReportsQuery = {}) =>
    backendFetch<Report>('reports', {
      searchParams: { days: query.days?.toString(), locationId: query.locationId },
    }),
};
