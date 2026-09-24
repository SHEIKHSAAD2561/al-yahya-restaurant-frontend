import { z } from 'zod';

export const companyFormSchema = z.object({
  name: z.string().min(1).max(150),
  vatNumber: z.string().max(50).optional().or(z.literal('')),
  email: z.string().email(),
  phone: z.string().max(30).optional().or(z.literal('')),
  website: z.string().url().max(255).optional().or(z.literal('')),
  // Loosely typed as `string` (not a strict enum) so an unselected default of
  // '' type-checks cleanly — the <Select> only ever offers real BUSINESS_TYPES
  // values, and `.min(1)` still enforces "required" at validation time.
  businessType: z.string().min(1, { message: 'Select a business type.' }),
  address: z.string().max(255).optional().or(z.literal('')),
  commercialRegister: z.string().max(100).optional().or(z.literal('')),
});

export type CompanyFormInput = z.infer<typeof companyFormSchema>;
