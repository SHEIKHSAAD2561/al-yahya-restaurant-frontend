'use client';

import { useQuery } from '@tanstack/react-query';
import { configurationApi } from '../api/configuration.api';
import { configurationKeys } from '../api/configuration.query-keys';

export function useConfigurationQuery() {
  return useQuery({
    queryKey: configurationKeys.detail(),
    queryFn: configurationApi.get,
  });
}
