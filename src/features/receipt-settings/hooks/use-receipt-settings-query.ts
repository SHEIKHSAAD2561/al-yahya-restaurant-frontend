'use client';

import { useQuery } from '@tanstack/react-query';
import { receiptSettingsApi } from '../api/receipt-settings.api';
import { receiptSettingsKeys } from '../api/receipt-settings.query-keys';

export function useReceiptSettingsQuery() {
  return useQuery({
    queryKey: receiptSettingsKeys.all,
    queryFn: receiptSettingsApi.get,
  });
}
