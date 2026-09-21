import { z } from 'zod';
import { LANGUAGES } from '../types/user';

/**
 * One shape for both Add and Edit — the drawer always collects every field
 * (email is just disabled, not omitted, when editing). The email/roleId split
 * between the backend's CreateUserDto/UpdateUserDto only matters at the API
 * payload boundary (see users.api.ts), not in form state.
 */
export const userFormSchema = z
  .object({
    nameEn: z.string().min(1).max(150),
    nameAr: z.string().min(1).max(150),
    email: z.string().email(),
    phone: z.string().max(30).optional().or(z.literal('')),
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
