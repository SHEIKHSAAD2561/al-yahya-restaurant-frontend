'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export function useDashboardSummaryQuery(locationId?: string) {
  return useQuery({
    queryKey: ['dashboard', 'summary', locationId],
    queryFn: () => dashboardApi.getSummary(locationId),
  });
}
