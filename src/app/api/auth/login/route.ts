import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { callBackend } from '@/core/api/backend-fetch-server';
import { mintSessionToken } from '@/core/auth/mint-session';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  SESSION_COOKIE,
  tokenCookieOptions,
  sessionCookieOptions,
} from '@/core/auth/cookies';

export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  const locale = request.headers.get('x-locale') ?? undefined;

  const loginResult = await callBackend('auth/login', { method: 'POST', body, locale });
  if (loginResult.status < 200 || loginResult.status >= 300) {
    return NextResponse.json(loginResult.body, { status: loginResult.status });
  }

  const { accessToken, refreshToken } = loginResult.body as {
    accessToken: string;
    refreshToken: string;
  };

  const sessionToken = await mintSessionToken(accessToken, locale);
  if (!sessionToken) {
    return NextResponse.json({ message: 'Could not load your profile.' }, { status: 502 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, tokenCookieOptions());
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, tokenCookieOptions());
  cookieStore.set(SESSION_COOKIE, sessionToken, sessionCookieOptions());

  return NextResponse.json({ ok: true });
}
