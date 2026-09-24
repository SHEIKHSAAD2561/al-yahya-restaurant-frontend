export const BUSINESS_TYPES = {
  RESTAURANT: 'RESTAURANT',
  CAFE: 'CAFE',
  BAKERY: 'BAKERY',
  FOOD_TRUCK: 'FOOD_TRUCK',
  CLOUD_KITCHEN: 'CLOUD_KITCHEN',
  CATERING: 'CATERING',
  OTHER: 'OTHER',
} as const;

export type BusinessType = (typeof BUSINESS_TYPES)[keyof typeof BUSINESS_TYPES];

export interface Company {
  id: string;
  name: string | null;
  vatNumber: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  businessType: BusinessType | null;
  address: string | null;
  commercialRegister: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
