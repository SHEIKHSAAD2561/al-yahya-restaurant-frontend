/** Mirrors al-yahya-restaurant-backend/src/modules/payment-methods/payment-method-type.enum.ts. */
export const PAYMENT_METHOD_TYPES = {
  CASH: 'CASH',
  CARD: 'CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  OTHER: 'OTHER',
} as const;

export type PaymentMethodType = (typeof PAYMENT_METHOD_TYPES)[keyof typeof PAYMENT_METHOD_TYPES];

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  /** Always null for CASH, required for every other type. */
  bankAccountId: string | null;
  description: string | null;
  /** Non-null for the built-in Cash/Credit Card rows — their type is locked. */
  systemCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  id: string;
  name: string;
  /** Null only for the built-in "Other Bank Accounts". */
  accountNumber: string | null;
  systemCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export function bankAccountLabel(account: BankAccount): string {
  return account.accountNumber ? `${account.name} - ${account.accountNumber}` : account.name;
}
