import { backendFetch } from '@/core/api/backend-fetch-client';
import type { PermissionsByModule } from '../types/permission';

export const permissionsApi = {
  listGroupedByModule: () => backendFetch<PermissionsByModule>('permissions'),
};
