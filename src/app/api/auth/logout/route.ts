import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { callBackend } from '@/core/api/backend-fetch-server';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  SESSION_COOKIE,
  expiredCookieOptions,
} from '@/core/auth/cookies';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  const locale = request.headers.get('x-locale') ?? undefined;

  if (accessToken) {
    // Always clear cookies locally below, even if this call fails/times out.
    await callBackend('auth/logout', {
      method: 'POST',
      body: { refreshToken },
      accessToken,
      locale,
    }).catch(() => undefined);
  }

  cookieStore.set(ACCESS_TOKEN_COOKIE, '', expiredCookieOptions());
  cookieStore.set(REFRESH_TOKEN_COOKIE, '', expiredCookieOptions());
  cookieStore.set(SESSION_COOKIE, '', expiredCookieOptions());

  return NextResponse.json({ ok: true });
}
