import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { env } from '@/core/config/env';
import type { RoleType } from './role-type';

/**
 * Our own compact session token — NOT the backend's access token.
 *
 * The backend's access JWT payload is only `{ sub }` (see
 * al-yahya-restaurant-backend/src/modules/auth/auth.service.ts `issueTokenPair`);
 * role/permission data only exists server-side after a DB lookup. So this app mints
 * its own signed cookie (from `GET /auth/me`) that carries the claims needed for
 * cheap, synchronous permission checks in `proxy.ts` and server components, without
 * decoding — or being able to decode — the backend's token.
 */
export interface SessionPayload {
  sub: string;
  nameEn: string;
  nameAr: string;
  email: string;
  roleId: string;
  roleType: RoleType;
  permissionCodes: string[];
  preferredLanguage: string;
  /** Standard JWT claim, set automatically by `setExpirationTime()` below —
   * declared here so callers can read it (seconds since epoch) to schedule
   * the session-expiry warning client-side. */
  exp?: number;
}

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(env.sessionSecret);
}

/**
 * `expiresAtSeconds` is an absolute Unix timestamp (seconds), not a duration —
 * callers pass the *backend access token's own* `exp` claim here (see
 * `mint-session.ts`), so this session cookie's lifetime always mirrors
 * whatever the backend's `JWT_ACCESS_EXPIRES_IN` actually is, with no
 * separate frontend-side duration to keep in sync.
 */
export async function signSession(payload: SessionPayload, expiresAtSeconds: number): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiresAtSeconds)
    .sign(getSecretKey());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, getSecretKey());
    return payload;
  } catch {
    return null;
  }
}
