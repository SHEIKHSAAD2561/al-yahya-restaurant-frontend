'use client';

import { useQuery } from '@tanstack/react-query';
import { accountingOverviewApi } from '../api/accounting-overview.api';

export function useSetupGuideQuery() {
  return useQuery({
    queryKey: ['accounting', 'setup-guide'] as const,
    queryFn: () => accountingOverviewApi.getSetupGuide(),
  });
}
