import type { PermissionModule } from '@/core/permissions/codes';

export interface Permission {
  id: string;
  module: PermissionModule;
  code: string;
  description: string;
}

export type PermissionsByModule = Partial<Record<PermissionModule, Permission[]>>;
