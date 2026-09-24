import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { callBackend } from '@/core/api/backend-fetch-server';
import { refreshSession } from '@/core/auth/refresh-session';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/core/auth/cookies';

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

  const isMultipart = (request.headers.get('content-type') ?? '').includes('multipart/form-data');
  const body =
    request.method === 'GET' || request.method === 'DELETE'
      ? undefined
      : isMultipart
        ? await request.formData().catch(() => undefined)
        : await request.json().catch(() => undefined);

  const result = await callBackend(targetPath, { method: request.method, body, accessToken, locale });

  if (result.status !== 401) {
    return NextResponse.json(result.body, { status: result.status });
  }

  if (!refreshToken) {
    return NextResponse.json(result.body, { status: 401 });
  }

  const refreshed = await refreshSession(refreshToken, locale);
  if (!refreshed.ok) {
    return NextResponse.json({ message: 'Session expired' }, { status: 401 });
  }

  const newAccessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? '';
  const retryResult = await callBackend(targetPath, {
    method: request.method,
    body,
    accessToken: newAccessToken,
    locale,
  });

  return NextResponse.json(retryResult.body, { status: retryResult.status });
}

export { handle as GET, handle as POST, handle as PATCH, handle as PUT, handle as DELETE };
