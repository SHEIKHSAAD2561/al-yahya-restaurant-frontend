import 'server-only';
import { getLocale } from 'next-intl/server';
import { redirect } from '@/core/i18n/navigation';
import { hasAllPermissions, hasAnyPermission } from '@/core/permissions/utils';
import type { PermissionCode } from '@/core/permissions/codes';
import { getSession, requireSession } from './session';
import type { SessionPayload } from './jwt-session';

/** Call at the top of a protected page/layout. Redirects to the dashboard home
 * if the signed-in user lacks the permission(s) — this is the fine-grained check
 * `proxy.ts` deliberately doesn't do (see proxy.ts for why). */
export async function requirePermission(
  ...codes: PermissionCode[]
): Promise<SessionPayload> {
  const session = await requireSession();
  if (!hasAllPermissions(session.permissionCodes, codes)) {
    const locale = await getLocale();
    redirect({ href: '/', locale });
  }
  return session;
}

/** Like {@link requirePermission}, but passes if the user has at least one of
 * the given codes — mirrors the backend's `RequireAnyPermission` decorator
 * (e.g. Stock Operations' create/edit, gated by either `stock.record_draft`
 * or `stock.manage_movements`). */
export async function requireAnyPermission(
  ...codes: PermissionCode[]
): Promise<SessionPayload> {
  const session = await requireSession();
  if (!hasAnyPermission(session.permissionCodes, codes)) {
    const locale = await getLocale();
    redirect({ href: '/', locale });
  }
  return session;
}

export { getSession, requireSession };
