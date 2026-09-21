import { z } from 'zod';

export const locationFormSchema = z.object({
  name: z.string().min(1).max(150),
  address: z.string().max(255).optional().or(z.literal('')),
  isDefault: z.boolean(),
});

export type LocationFormInput = z.infer<typeof locationFormSchema>;
