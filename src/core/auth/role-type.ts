/**
 * Mirrors the backend's RoleType enum
 * (al-yahya-restaurant-backend/src/modules/roles/role-type.enum.ts).
 */
export const ROLE_TYPES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  DEFAULT: 'DEFAULT',
  CUSTOM: 'CUSTOM',
} as const;

export type RoleType = (typeof ROLE_TYPES)[keyof typeof ROLE_TYPES];
