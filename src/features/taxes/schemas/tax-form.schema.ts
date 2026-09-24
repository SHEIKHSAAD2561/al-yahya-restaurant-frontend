import { z } from 'zod';

export const taxLineFormSchema = z.object({
  label: z.string().max(100).optional().or(z.literal('')),
  rate: z.number().min(0).max(1000),
});

export const taxFormSchema = z
  .object({
    name: z.string().min(1).max(150),
    code: z.string().min(1).max(50),
    hasCompoundTax: z.boolean(),
    lines: z.array(taxLineFormSchema).min(1, { message: 'Add at least one tax line.' }),
    compoundLabel: z.string().max(100).optional().or(z.literal('')),
    compoundRate: z.number().min(0).max(1000).optional(),
  })
  // The compound rate box only appears (and only matters) once "Has
  // Compound Tax" is checked — mirrors the backend's own ValidateIf.
  .refine((data) => !data.hasCompoundTax || data.compoundRate !== undefined, {
    message: 'Enter a compound tax rate.',
    path: ['compoundRate'],
  });

export type TaxLineFormInput = z.infer<typeof taxLineFormSchema>;
export type TaxFormInput = z.infer<typeof taxFormSchema>;
