import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { getLocale } from 'next-intl/server';
import { redirect } from '@/core/i18n/navigation';
import { SESSION_COOKIE } from './cookies';
import { verifySession, type SessionPayload } from './jwt-session';

/** `cache()` de-dupes this within a single request/render pass. */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
});

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (session) {
    return session;
  }

  const locale = await getLocale();
  redirect({ href: '/login', locale });
  throw new Error('unreachable');
}
