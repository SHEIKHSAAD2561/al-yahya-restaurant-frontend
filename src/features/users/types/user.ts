export const USER_STATUSES = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type UserStatus = (typeof USER_STATUSES)[keyof typeof USER_STATUSES];

export const LANGUAGES = {
  EN: 'en',
  AR: 'ar',
} as const;
export type UserLanguage = (typeof LANGUAGES)[keyof typeof LANGUAGES];

export interface UserRole {
  id: string;
  nameEn: string;
  nameAr: string;
  type: string;
}

export interface UserLocationRef {
  id: string;
  name: string;
}

export interface User {
  id: string;
  nameEn: string;
  nameAr: string;
  email: string;
  phone: string | null;
  status: UserStatus;
  roleId: string;
  role: UserRole;
  allLocations: boolean;
  locations: UserLocationRef[];
  preferredLanguage: UserLanguage;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}
