'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useLocale } from 'next-intl';
import type { RoleType } from '@/core/auth/role-type';

/** Plain-serializable subset of the server session, passed down once from
 * `(dashboard)/layout.tsx` so client components can check permissions without
 * a round-trip. Never carries tokens — those stay in httpOnly cookies. */
export interface ClientSession {
  id: string;
  nameEn: string;
  nameAr: string;
  email: string;
  roleId: string;
  roleType: RoleType;
  permissionCodes: string[];
  preferredLanguage: string;
}

const SessionContext = createContext<ClientSession | null>(null);

export function SessionProvider({
  session,
  children,
}: {
  session: ClientSession;
  children: ReactNode;
}) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useSession(): ClientSession {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error('useSession() must be used within <SessionProvider>.');
  }
  return session;
}

export function usePermission(code: string): boolean {
  const session = useSession();
  return session.permissionCodes.includes(code);
}

export function useAnyPermission(codes: string[]): boolean {
  const session = useSession();
  return codes.some((code) => session.permissionCodes.includes(code));
}

/** The current user's own name, localized to the active locale. */
export function useDisplayName(): string {
  const session = useSession();
  const locale = useLocale();
  return locale === 'ar' ? session.nameAr : session.nameEn;
}
