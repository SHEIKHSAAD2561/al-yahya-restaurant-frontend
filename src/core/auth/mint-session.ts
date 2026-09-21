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

/** Calls backend `GET /auth/me` and signs our own compact session cookie from
 * the result. Shared by the login route and the catch-all proxy's silent-refresh
 * path — both need to (re-)mint the session after obtaining a fresh access token. */
export async function mintSessionToken(accessToken: string, locale?: string): Promise<string | null> {
  const meResult = await callBackend('auth/me', { accessToken, locale });
  if (meResult.status !== 200) return null;

  const profile = meResult.body as AuthProfileResponse;

  return signSession({
    sub: profile.id,
    nameEn: profile.nameEn,
    nameAr: profile.nameAr,
    email: profile.email,
    roleId: profile.role.id,
    roleType: profile.role.type,
    permissionCodes: profile.permissionCodes,
    preferredLanguage: profile.preferredLanguage,
  });
}
