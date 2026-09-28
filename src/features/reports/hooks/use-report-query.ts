'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { reportsApi, type ReportsQuery } from '../api/reports.api';

export function useReportQuery(query: ReportsQuery) {
  return useQuery({
    queryKey: ['reports', query],
    queryFn: () => reportsApi.get(query),
    placeholderData: keepPreviousData,
  });
}
