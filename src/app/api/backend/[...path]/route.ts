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
  expiredCookieOptions,
} from '@/core/auth/cookies';

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

/**
 * Single authenticated proxy for every backend resource (users/roles/
 * permissions/locations/...): attaches the httpOnly access token + locale,
 * and on a 401 does one silent refresh before giving up. This is the only
 * place (besides the /api/auth/* routes) that ever touches the token cookies.
 */
async function handle(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { path } = await params;
  const targetPath = `${path.join('/')}${request.nextUrl.search}`;
  const locale = request.headers.get('x-locale') ?? undefined;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  const body =
    request.method === 'GET' || request.method === 'DELETE'
      ? undefined
      : await request.json().catch(() => undefined);

  const result = await callBackend(targetPath, { method: request.method, body, accessToken, locale });

  if (result.status !== 401) {
    return NextResponse.json(result.body, { status: result.status });
  }

  if (!refreshToken) {
    return NextResponse.json(result.body, { status: 401 });
  }

  const refreshResult = await callBackend('auth/refresh', {
    method: 'POST',
    body: { refreshToken },
    locale,
  });

  if (refreshResult.status < 200 || refreshResult.status >= 300) {
    cookieStore.set(ACCESS_TOKEN_COOKIE, '', expiredCookieOptions());
    cookieStore.set(REFRESH_TOKEN_COOKIE, '', expiredCookieOptions());
    cookieStore.set(SESSION_COOKIE, '', expiredCookieOptions());
    return NextResponse.json({ message: 'Session expired' }, { status: 401 });
  }

  const newTokens = refreshResult.body as { accessToken: string; refreshToken: string };
  const sessionToken = await mintSessionToken(newTokens.accessToken, locale);

  if (!sessionToken) {
    cookieStore.set(ACCESS_TOKEN_COOKIE, '', expiredCookieOptions());
    cookieStore.set(REFRESH_TOKEN_COOKIE, '', expiredCookieOptions());
    cookieStore.set(SESSION_COOKIE, '', expiredCookieOptions());
    return NextResponse.json({ message: 'Session expired' }, { status: 401 });
  }

  cookieStore.set(ACCESS_TOKEN_COOKIE, newTokens.accessToken, tokenCookieOptions());
  cookieStore.set(REFRESH_TOKEN_COOKIE, newTokens.refreshToken, tokenCookieOptions());
  cookieStore.set(SESSION_COOKIE, sessionToken, sessionCookieOptions());

  const retryResult = await callBackend(targetPath, {
    method: request.method,
    body,
    accessToken: newTokens.accessToken,
    locale,
  });

  return NextResponse.json(retryResult.body, { status: retryResult.status });
}

export { handle as GET, handle as POST, handle as PATCH, handle as PUT, handle as DELETE };
