import 'server-only';
import { cookies } from 'next/headers';
import { callBackend } from '@/core/api/backend-fetch-server';
import { mintSessionToken } from './mint-session';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  SESSION_COOKIE,
  tokenCookieOptions,
  sessionCookieOptions,
  expiredCookieOptions,
} from './cookies';

export interface RefreshOutcome {
  ok: boolean;
  /** Seconds-since-epoch the new session expires — only set when ok. Lets a
   * caller (the /api/auth/refresh-session route) tell the client when to
   * schedule the next expiry warning, without the client ever reading the
   * httpOnly cookie itself. */
  exp?: number;
}

/**
 * Rotates the backend refresh token, re-mints this app's own `session`
 * cookie from the result, and writes all three cookies. Shared by the
 * catch-all proxy's silent-refresh-on-401 path and the dedicated
 * `/api/auth/refresh-session` route the session-expiry warning calls —
 * both need the exact same rotate-and-re-mint sequence.
 */
export async function refreshSession(refreshToken: string, locale?: string): Promise<RefreshOutcome> {
  const cookieStore = await cookies();

  const refreshResult = await callBackend('auth/refresh', {
    method: 'POST',
    body: { refreshToken },
    locale,
  });

  if (refreshResult.status < 200 || refreshResult.status >= 300) {
    cookieStore.set(ACCESS_TOKEN_COOKIE, '', expiredCookieOptions());
    cookieStore.set(REFRESH_TOKEN_COOKIE, '', expiredCookieOptions());
    cookieStore.set(SESSION_COOKIE, '', expiredCookieOptions());
    return { ok: false };
  }

  const newTokens = refreshResult.body as {
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: string;
  };
  const minted = await mintSessionToken(newTokens.accessToken, newTokens.refreshTokenExpiresAt, locale);

  if (!minted) {
    cookieStore.set(ACCESS_TOKEN_COOKIE, '', expiredCookieOptions());
    cookieStore.set(REFRESH_TOKEN_COOKIE, '', expiredCookieOptions());
    cookieStore.set(SESSION_COOKIE, '', expiredCookieOptions());
    return { ok: false };
  }

  cookieStore.set(ACCESS_TOKEN_COOKIE, newTokens.accessToken, tokenCookieOptions());
  cookieStore.set(REFRESH_TOKEN_COOKIE, newTokens.refreshToken, tokenCookieOptions());
  cookieStore.set(SESSION_COOKIE, minted.token, sessionCookieOptions(minted.exp));

  return { ok: true, exp: minted.exp };
}
