export const TAX_TYPES = {
  SYSTEM_LOCKED: 'SYSTEM_LOCKED',
  SYSTEM_TOGGLABLE: 'SYSTEM_TOGGLABLE',
  CUSTOM: 'CUSTOM',
} as const;

export type TaxType = (typeof TAX_TYPES)[keyof typeof TAX_TYPES];
