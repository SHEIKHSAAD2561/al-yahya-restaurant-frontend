import { backendFetch } from '@/core/api/backend-fetch-client';
import type {
  CashMovement,
  CashMovementType,
  Denomination,
  LocationRegisters,
  PrinterType,
  RegisterSession,
  RegisterSummary,
} from '../types/register';

export interface CreateRegisterInput {
  locationId: string;
  name: string;
  printerType?: PrinterType;
  cashierIds: string[];
  paymentMethodIds: string[];
}

export type UpdateRegisterInput = Partial<Omit<CreateRegisterInput, 'locationId'>>;

export interface DenominationsInput {
  amount: number;
  denominations: Denomination[];
}

export interface PaymentMethodCountInput {
  paymentMethodId: string;
  countedAmount: number;
  /** Only meaningful for the register's cash-type payment method. */
  denominations: Denomination[];
}

export interface CloseRegisterInput {
  counts: PaymentMethodCountInput[];
}

export const registersApi = {
  list: () => backendFetch<LocationRegisters[]>('registers'),
  get: (id: string) => backendFetch<RegisterSummary>(`registers/${id}`),
  create: (input: CreateRegisterInput) =>
    backendFetch<RegisterSummary>('registers', { method: 'POST', body: input }),
  update: (id: string, input: UpdateRegisterInput) =>
    backendFetch<RegisterSummary>(`registers/${id}`, { method: 'PATCH', body: input }),
  open: (id: string, input: DenominationsInput) =>
    backendFetch<RegisterSession>(`registers/${id}/open`, {
      method: 'POST',
      body: { openingAmount: input.amount, denominations: input.denominations },
    }),
  close: (id: string, input: CloseRegisterInput) =>
    backendFetch<RegisterSession>(`registers/${id}/close`, {
      method: 'POST',
      body: input,
    }),
  addCashMovement: (id: string, input: { type: CashMovementType; amount: number; reason?: string }) =>
    backendFetch<CashMovement>(`registers/${id}/cash-movements`, { method: 'POST', body: input }),
  listCashMovements: (id: string) => backendFetch<CashMovement[]>(`registers/${id}/cash-movements`),
};
