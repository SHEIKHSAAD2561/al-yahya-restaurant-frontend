import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/core/i18n/routing';
import { SESSION_COOKIE } from '@/core/auth/cookies';
import { verifySession } from '@/core/auth/jwt-session';
import { SETTINGS_TABS } from '@/core/nav/nav-config';

const intlMiddleware = createMiddleware(routing);

const PUBLIC_PATHS = ['/login', '/accept-invitation', '/forgot-password'];

function stripLocale(pathname: string): string {
  const segments = pathname.split('/');
  const maybeLocale = segments[1];
  if ((routing.locales as readonly string[]).includes(maybeLocale)) {
    return `/${segments.slice(2).join('/')}`;
  }
  return pathname;
}

function localeFromPathname(pathname: string): string {
  const maybeLocale = pathname.split('/')[1];
  return (routing.locales as readonly string[]).includes(maybeLocale)
    ? maybeLocale
    : routing.defaultLocale;
}

/**
 * Composes next-intl's locale detection with a coarse "is there a session"
 * gate. Deliberately does NOT do fine-grained permission-code checks here —
 * per Next's own guidance, proxy should do coarse checks only; every
 * protected page re-verifies via `requirePermission()` (see core/auth/permissions.ts).
 *
 * The one exception is `/settings` itself, which has no page of its own: it
 * must land on whichever settings tab the signed-in user actually has
 * permission for, which needs their permission codes — already sitting right
 * here in the session cookie, no extra request needed. This still has to
 * happen here (not as a `redirect()` inside a page component) so it resolves
 * before any page renders — doing it mid-render broke Next's dev-mode
 * performance instrumentation (see the `next.config.ts` redirects() history
 * this replaced).
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const intlResponse = intlMiddleware(request);

  const pathname = stripLocale(request.nextUrl.pathname);
  const locale = localeFromPathname(request.nextUrl.pathname);
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionToken ? await verifySession(sessionToken) : null;

  if (isPublicPath) {
    if (session) {
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }
    return intlResponse;
  }

  if (!session) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/settings') {
    const firstAccessibleTab = SETTINGS_TABS.find((tab) =>
      session.permissionCodes.includes(tab.permission),
    );
    const destination = firstAccessibleTab?.href ?? '/';
    return NextResponse.redirect(new URL(`/${locale}${destination}`, request.url));
  }

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
