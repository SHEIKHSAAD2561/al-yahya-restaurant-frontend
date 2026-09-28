import { backendFetch } from '@/core/api/backend-fetch-client';
import type { DashboardSummary } from '../types/dashboard';

export const dashboardApi = {
  getSummary: (locationId?: string) =>
    backendFetch<DashboardSummary>('dashboard/summary', { searchParams: { locationId } }),
};
