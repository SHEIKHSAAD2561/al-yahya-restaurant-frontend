export const CUSTOMER_GENDERS = { MALE: 'MALE', FEMALE: 'FEMALE' } as const;
export type CustomerGender = (typeof CUSTOMER_GENDERS)[keyof typeof CUSTOMER_GENDERS];

export interface Customer {
  id: string;
  name: string;
  code: string;
  phone: string;
  email: string | null;
  gender: CustomerGender | null;
  birthday: string | null;
  vatNumber: string | null;
  commercialRegisterNumber: string | null;
  nationalId: string | null;
  country: string | null;
  city: string | null;
  district: string | null;
  street: string | null;
  buildingNumber: string | null;
  additionalNumber: string | null;
  postalCode: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** The list (and `GET /customers/:id`) add these, derived server-side from
 * this customer's sales/payments — see the backend CLAUDE.md's Customer
 * Payments section. */
export interface CustomerListItem extends Customer {
  totalPaid: number;
  debitAmount: number;
}

export interface CustomerListPage {
  items: CustomerListItem[];
  total: number;
  page: number;
  pageSize: number;
}
