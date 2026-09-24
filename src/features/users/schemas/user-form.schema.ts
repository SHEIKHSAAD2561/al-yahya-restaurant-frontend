import { z } from 'zod';
import { LANGUAGES } from '../types/user';

/**
 * One shape for both Add and Edit — the drawer always collects every field
 * (email is just disabled, not omitted, when editing). The email/roleId split
 * between the backend's CreateUserDto/UpdateUserDto only matters at the API
 * payload boundary (see users.api.ts), not in form state.
 *
 * Phone is split into country code + national number for entry (defaulting
 * to +966), then joined into the one `phone` string the backend stores —
 * see joinPhoneNumber()/splitPhoneNumber() in core/phone/country-codes.ts.
 */
export const userFormSchema = z
  .object({
    nameEn: z.string().min(1).max(150),
    nameAr: z.string().min(1).max(150),
    email: z.string().email(),
    phoneCountryCode: z.string().min(1),
    phoneNumber: z.string().max(20).optional().or(z.literal('')),
    roleId: z.string().uuid({ message: 'Select a role.' }),
    allLocations: z.boolean(),
    locationIds: z.array(z.string().uuid()),
    preferredLanguage: z.enum([LANGUAGES.EN, LANGUAGES.AR]),
  })
  .refine((data) => data.allLocations || data.locationIds.length > 0, {
    message: 'Select at least one location.',
    path: ['locationIds'],
  });

export type UserFormInput = z.infer<typeof userFormSchema>;
