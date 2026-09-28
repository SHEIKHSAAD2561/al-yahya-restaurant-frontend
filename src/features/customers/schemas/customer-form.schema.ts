import { z } from 'zod';
import { CUSTOMER_GENDERS } from '../types/customer';

export const customerFormSchema = z.object({
  name: z.string().trim().min(1).max(150),
  code: z.string().trim().min(1).max(30),
  phoneCountryCode: z.string(),
  phoneNumber: z.string().trim().min(1),
  email: z.string().trim().max(255),
  // '' = unset; the two real values come from the CUSTOMER_GENDERS enum.
  gender: z.union([z.enum(CUSTOMER_GENDERS), z.literal('')]),
  birthday: z.string(),
  vatNumber: z
    .string()
    .trim()
    .refine((value) => value === '' || /^3\d{13}3$/.test(value), { message: 'invalid' }),
  commercialRegisterNumber: z.string().trim().max(100),
  nationalId: z.string().trim().max(50),
  country: z.string().trim().max(100),
  city: z.string().trim().max(100),
  district: z.string().trim().max(100),
  street: z.string().trim().max(150),
  buildingNumber: z.string().trim().max(10),
  additionalNumber: z.string().trim().max(10),
  postalCode: z.string().trim().max(10),
  notes: z.string().trim().max(2000),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
