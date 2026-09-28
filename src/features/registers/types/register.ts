/** Mirrors al-yahya-restaurant-backend's register-enums.ts. */
export const PRINTER_TYPES = { THERMAL: 'THERMAL', A4: 'A4' } as const;
export type PrinterType = (typeof PRINTER_TYPES)[keyof typeof PRINTER_TYPES];

export const SELL_LAYOUTS = { QUICK_SALE: 'QUICK_SALE' } as const;
export type SellLayout = (typeof SELL_LAYOUTS)[keyof typeof SELL_LAYOUTS];

export const CASH_MOVEMENT_TYPES = { IN: 'IN', OUT: 'OUT' } as const;
export type CashMovementType = (typeof CASH_MOVEMENT_TYPES)[keyof typeof CASH_MOVEMENT_TYPES];

export interface Denomination {
  value: number;
  count: number;
}

export interface RegisterCashier {
  id: string;
  nameEn: string;
  nameAr: string;
}

/** Mirrors al-yahya-restaurant-backend's payment-method-type.enum.ts (kept
 * local rather than importing from the payment-methods feature, to avoid a
 * cross-feature dependency for a single field). */
export type PaymentMethodRefType = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'OTHER';

export interface RegisterPaymentMethodRef {
  id: string;
  name: string;
  type: PaymentMethodRefType;
}

export interface OpenSessionSummary {
  id: string;
  openedAt: string;
  openedByUserId: string;
  openedByName: string;
}

export interface RegisterSummary {
  id: string;
  name: string;
  locationId: string;
  printerType: PrinterType;
  sellLayout: SellLayout;
  cashiers: RegisterCashier[];
  paymentMethods: RegisterPaymentMethodRef[];
  openSession: OpenSessionSummary | null;
}

export interface LocationRegisters {
  locationId: string;
  locationName: string;
  registers: RegisterSummary[];
}

export interface RegisterSession {
  id: string;
  registerId: string;
  status: 'OPEN' | 'CLOSED';
  openedByUserId: string;
  openedAt: string;
  openingAmount: number;
  openingDenominations: Denomination[] | null;
  closedByUserId: string | null;
  closedAt: string | null;
  closingAmount: number | null;
  closingDenominations: Denomination[] | null;
  expectedAmount: number | null;
  difference: number | null;
}

export interface CashMovement {
  id: string;
  registerSessionId: string;
  type: CashMovementType;
  amount: number;
  reason: string | null;
  createdByUserId: string;
  createdAt: string;
}

/** Standard cash denominations shown on Open/Close Register — SAR notes and coins. */
export const SAR_DENOMINATIONS = [500, 200, 100, 50, 20, 10, 5, 1, 0.5, 0.25] as const;
