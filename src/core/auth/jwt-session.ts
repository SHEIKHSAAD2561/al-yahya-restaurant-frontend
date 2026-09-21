import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { env } from '@/core/config/env';
import { SESSION_MAX_AGE_SECONDS } from './cookies';
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
}

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(env.sessionSecret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
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
