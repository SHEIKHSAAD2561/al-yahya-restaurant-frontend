import { backendFetch } from '@/core/api/backend-fetch-client';
import type { BankAccount, PaymentMethod, PaymentMethodType } from '../types/payment-method';

export interface CreatePaymentMethodInput {
  name: string;
  type: PaymentMethodType;
  bankAccountId: string | null;
  description: string | null;
}

export type UpdatePaymentMethodInput = Partial<CreatePaymentMethodInput>;

export interface CreateBankAccountInput {
  name: string;
  accountNumber: string;
}

export const paymentMethodsApi = {
  list: () => backendFetch<PaymentMethod[]>('payment-methods'),
  create: (input: CreatePaymentMethodInput) =>
    backendFetch<PaymentMethod>('payment-methods', { method: 'POST', body: input }),
  update: (id: string, input: UpdatePaymentMethodInput) =>
    backendFetch<PaymentMethod>(`payment-methods/${id}`, { method: 'PATCH', body: input }),
};

export const bankAccountsApi = {
  list: () => backendFetch<BankAccount[]>('bank-accounts'),
  create: (input: CreateBankAccountInput) =>
    backendFetch<BankAccount>('bank-accounts', { method: 'POST', body: input }),
};
