import 'server-only';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';
export const SESSION_COOKIE = 'session';

/** How long the backend's own tokens are kept around client-side. The backend's real
 * 401 response (not this value) is the source of truth for whether they still work —
 * see the silent-refresh logic in `app/api/backend/[...path]/route.ts`. */
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

/** Re-signed on every login/refresh; short-lived so a revoked/edited role can't
 * stay effective in the UI for long. */
export const SESSION_MAX_AGE_SECONDS = 60 * 15; // 15 minutes

interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  path: string;
  maxAge: number;
}

const baseCookieOptions: Omit<CookieOptions, 'maxAge'> = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};

export function tokenCookieOptions(): CookieOptions {
  return { ...baseCookieOptions, maxAge: TOKEN_MAX_AGE_SECONDS };
}

export function sessionCookieOptions(): CookieOptions {
  return { ...baseCookieOptions, maxAge: SESSION_MAX_AGE_SECONDS };
}

export function expiredCookieOptions(): CookieOptions {
  return { ...baseCookieOptions, maxAge: 0 };
}
