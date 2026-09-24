import 'server-only';
import { callBackend } from '@/core/api/backend-fetch-server';
import { signSession } from './jwt-session';
import type { RoleType } from './role-type';

interface AuthProfileResponse {
  id: string;
  nameEn: string;
  nameAr: string;
  email: string;
  preferredLanguage: string;
  role: { id: string; name: string; type: RoleType };
  permissionCodes: string[];
}

export interface MintedSession {
  token: string;
  /** Seconds-since-epoch — mirrors the backend refresh token's real expiry. */
  exp: number;
}

/**
 * Calls backend `GET /auth/me` and signs our own compact session cookie from
 * the result. Shared by the login route and the catch-all proxy's
 * silent-refresh path — both need to (re-)mint the session after obtaining a
 * fresh token pair.
 *
 * The session's expiry mirrors `refreshTokenExpiresAt` from that same token
 * pair (see `AuthService.issueTokenPair` in the backend) — **not** the access
 * token's own (much shorter, silently auto-renewed, invisible to the user)
 * expiry. The access token expiring is a non-event; the refresh token
 * expiring is the real point of no return where no more silent refreshes are
 * possible and the user must log in again — that's what the session-expiry
 * warning popup needs to count down to.
 */
export async function mintSessionToken(
  accessToken: string,
  refreshTokenExpiresAt: string,
  locale?: string,
): Promise<MintedSession | null> {
  const meResult = await callBackend('auth/me', { accessToken, locale });
  if (meResult.status !== 200) return null;

  const profile = meResult.body as AuthProfileResponse;
  const expiresAtSeconds = Math.floor(new Date(refreshTokenExpiresAt).getTime() / 1000);

  const token = await signSession(
    {
      sub: profile.id,
      nameEn: profile.nameEn,
      nameAr: profile.nameAr,
      email: profile.email,
      roleId: profile.role.id,
      roleType: profile.role.type,
      permissionCodes: profile.permissionCodes,
      preferredLanguage: profile.preferredLanguage,
    },
    expiresAtSeconds,
  );

  return { token, exp: expiresAtSeconds };
}
