import { z } from 'zod';
import { PAYMENT_METHOD_TYPES } from '../types/payment-method';

export const paymentMethodFormSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    // '' until chosen, so the "Choose Type" placeholder shows on a new row.
    type: z.union([z.enum(PAYMENT_METHOD_TYPES), z.literal('')]),
    bankAccountId: z.string(),
    description: z.string().max(255),
  })
  .refine((values) => values.type !== '', { path: ['type'] })
  // Mirrors the backend rule: every non-cash type deposits into an account.
  .refine((values) => values.type === PAYMENT_METHOD_TYPES.CASH || values.bankAccountId !== '', {
    path: ['bankAccountId'],
  });

export type PaymentMethodFormInput = z.infer<typeof paymentMethodFormSchema>;

export const bankAccountFormSchema = z.object({
  name: z.string().trim().min(1).max(100),
  accountNumber: z.string().trim().min(1).max(50),
});

export type BankAccountFormInput = z.infer<typeof bankAccountFormSchema>;
