'use client';

import { useQuery } from '@tanstack/react-query';
import { saleSettingsApi } from '../api/sale-settings.api';
import { saleSettingsKeys } from '../api/sale-settings.query-keys';

export function useSaleSettingsQuery() {
  return useQuery({
    queryKey: saleSettingsKeys.all,
    queryFn: saleSettingsApi.get,
  });
}
