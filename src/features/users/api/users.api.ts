import { backendFetch } from '@/core/api/backend-fetch-client';
import type { User, UserStatus } from '../types/user';

export interface UsersQuery {
  search?: string;
  roleId?: string;
  status?: UserStatus;
}

export interface CreateUserPayload {
  nameEn: string;
  nameAr: string;
  email: string;
  phone?: string;
  roleId: string;
  allLocations?: boolean;
  locationIds?: string[];
  preferredLanguage?: string;
}

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, 'email'>>;

export const usersApi = {
  list: (query: UsersQuery = {}) =>
    backendFetch<User[]>('users', {
      searchParams: { search: query.search, roleId: query.roleId, status: query.status },
    }),
  get: (id: string) => backendFetch<User>(`users/${id}`),
  create: (payload: CreateUserPayload) =>
    backendFetch<User>('users', { method: 'POST', body: payload }),
  update: (id: string, payload: UpdateUserPayload) =>
    backendFetch<User>(`users/${id}`, { method: 'PATCH', body: payload }),
  updateStatus: (id: string, status: UserStatus) =>
    backendFetch<User>(`users/${id}/status`, { method: 'PATCH', body: { status } }),
};
