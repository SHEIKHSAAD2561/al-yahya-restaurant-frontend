import { backendFetch } from '@/core/api/backend-fetch-client';
import type { DigitalMenuData, DigitalMenuLocation } from '@/core/digital-menu/get-digital-menu';

export const digitalMenuApi = {
  get: (locationId?: string) => backendFetch<DigitalMenuData>('digital-menu', { searchParams: { locationId } }),
  listLocations: () => backendFetch<DigitalMenuLocation[]>('digital-menu/locations'),
};
