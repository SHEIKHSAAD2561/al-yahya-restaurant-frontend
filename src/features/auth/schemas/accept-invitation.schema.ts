import { z } from 'zod';

export function createAcceptInvitationFormSchema(passwordsDontMatchMessage: string) {
  return z
    .object({
      token: z.string().min(1),
      password: z.string().min(8),
      confirmPassword: z.string().min(1),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: passwordsDontMatchMessage,
      path: ['confirmPassword'],
    });
}

export type AcceptInvitationFormInput = z.infer<ReturnType<typeof createAcceptInvitationFormSchema>>;

/** What actually goes to the backend — confirmPassword never leaves the form. */
export type AcceptInvitationInput = Omit<AcceptInvitationFormInput, 'confirmPassword'>;
