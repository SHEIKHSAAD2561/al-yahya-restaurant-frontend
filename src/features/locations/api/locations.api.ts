import { backendFetch } from '@/core/api/backend-fetch-client';
import type { Location } from '../types/location';

export interface CreateLocationInput {
  name: string;
  address?: string;
  isDefault?: boolean;
}

export type UpdateLocationInput = Partial<CreateLocationInput & { isActive: boolean }>;

export const locationsApi = {
  list: () => backendFetch<Location[]>('locations'),
  get: (id: string) => backendFetch<Location>(`locations/${id}`),
  create: (input: CreateLocationInput) =>
    backendFetch<Location>('locations', { method: 'POST', body: input }),
  update: (id: string, input: UpdateLocationInput) =>
    backendFetch<Location>(`locations/${id}`, { method: 'PATCH', body: input }),
  /** Convenience wrapper — `PATCH /locations/:id` only ever *moves* the
   * default via `isDefault: true` (see backend LocationsService.update). */
  setDefault: (id: string) =>
    backendFetch<Location>(`locations/${id}`, { method: 'PATCH', body: { isDefault: true } }),
  remove: (id: string) => backendFetch<void>(`locations/${id}`, { method: 'DELETE' }),
};
