import 'server-only';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';
export const SESSION_COOKIE = 'session';

/** How long the backend's own tokens are kept around client-side. The backend's real
 * 401 response (not this value) is the source of truth for whether they still work —
 * see the silent-refresh logic in `app/api/backend/[...path]/route.ts`. */
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

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

/** `expiresAtSeconds` is the same absolute timestamp signed into the session
 * JWT itself (see `mint-session.ts`) — the cookie's browser-level `maxAge`
 * and the token's own `exp` claim always agree because they come from the
 * same source (the backend access token's real expiry), never a separately
 * configured duration. */
export function sessionCookieOptions(expiresAtSeconds: number): CookieOptions {
  const maxAge = Math.max(expiresAtSeconds - Math.floor(Date.now() / 1000), 0);
  return { ...baseCookieOptions, maxAge };
}

export function expiredCookieOptions(): CookieOptions {
  return { ...baseCookieOptions, maxAge: 0 };
}
