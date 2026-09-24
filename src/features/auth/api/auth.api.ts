import { ApiError } from '@/core/api/http-error';
import type { LoginInput } from '../schemas/login.schema';
import type { AcceptInvitationInput } from '../schemas/accept-invitation.schema';
import type { ForgotPasswordInput } from '../schemas/forgot-password.schema';

/**
 * These call this app's own `/api/auth/*` Route Handlers — never the NestJS
 * backend directly — because those routes are the only place that mints or
 * clears the httpOnly session cookies (see src/app/api/auth/*).
 */
async function postAuthRoute<T = void>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`/api/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const raw = (data as { message?: string | string[] } | null)?.message;
    const message = Array.isArray(raw) ? raw.join(', ') : (raw ?? 'Request failed');
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export interface RefreshSessionResult {
  ok: true;
  exp?: number;
}

export const authApi = {
  login: (input: LoginInput) => postAuthRoute('login', input),
  logout: () => postAuthRoute('logout', {}),
  acceptInvitation: (input: AcceptInvitationInput) => postAuthRoute('accept-invitation', input),
  forgotPassword: (input: ForgotPasswordInput) => postAuthRoute('forgot-password', input),
  refreshSession: () => postAuthRoute<RefreshSessionResult>('refresh-session', {}),
};
