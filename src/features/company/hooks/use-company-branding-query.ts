'use client';

import { useQuery } from '@tanstack/react-query';
import { companyApi } from '../api/company.api';
import { companyKeys } from '../api/company.query-keys';

export function useCompanyBrandingQuery() {
  return useQuery({
    queryKey: companyKeys.branding,
    queryFn: companyApi.getBranding,
  });
}
