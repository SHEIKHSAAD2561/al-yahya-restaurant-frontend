import { backendFetch } from '@/core/api/backend-fetch-client';
import type { SaleSettings, SaleSettingsInput } from '../types/sale-settings';

export const saleSettingsApi = {
  get: () => backendFetch<SaleSettings>('sale-settings'),
  update: (input: SaleSettingsInput) =>
    backendFetch<SaleSettings>('sale-settings', { method: 'PATCH', body: input }),
};
