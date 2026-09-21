import { backendFetch } from '@/core/api/backend-fetch-client';
import type { Role } from '../types/role';

export interface CreateRoleInput {
  nameEn: string;
  nameAr: string;
}

export interface UpdateRolePermissionsInput {
  permissionCodes: string[];
}

export const rolesApi = {
  list: () => backendFetch<Role[]>('roles'),
  get: (id: string) => backendFetch<Role>(`roles/${id}`),
  create: (input: CreateRoleInput) => backendFetch<Role>('roles', { method: 'POST', body: input }),
  updatePermissions: (id: string, input: UpdateRolePermissionsInput) =>
    backendFetch<Role>(`roles/${id}/permissions`, { method: 'PATCH', body: input }),
  remove: (id: string) => backendFetch<void>(`roles/${id}`, { method: 'DELETE' }),
};
