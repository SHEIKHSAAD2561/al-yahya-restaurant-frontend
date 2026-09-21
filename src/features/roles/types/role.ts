import type { RoleType } from '@/core/auth/role-type';

export interface Role {
  id: string;
  name: string;
  type: RoleType;
  isLocked: boolean;
  isDeletable: boolean;
  permissionCodes: string[];
}
