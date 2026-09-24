'use client';

import { useQuery } from '@tanstack/react-query';
import { companyApi } from '../api/company.api';
import { companyKeys } from '../api/company.query-keys';

export function useCompanyQuery() {
  return useQuery({
    queryKey: companyKeys.all,
    queryFn: companyApi.get,
  });
}
