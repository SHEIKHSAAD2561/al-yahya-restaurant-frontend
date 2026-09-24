import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { refreshSession } from '@/core/auth/refresh-session';
import { REFRESH_TOKEN_COOKIE } from '@/core/auth/cookies';

/** Called by the session-expiry warning popup when the user clicks "Stay
 * signed in" — proactively rotates the refresh token and re-mints the
 * session cookie, same as the silent on-401 refresh, just triggered by the
 * user instead of a failed request. */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  const locale = request.headers.get('x-locale') ?? undefined;

  if (!refreshToken) {
    return NextResponse.json({ message: 'No session to refresh.' }, { status: 401 });
  }

  const result = await refreshSession(refreshToken, locale);
  if (!result.ok) {
    return NextResponse.json({ message: 'Session expired.' }, { status: 401 });
  }

  return NextResponse.json({ ok: true, exp: result.exp });
}
