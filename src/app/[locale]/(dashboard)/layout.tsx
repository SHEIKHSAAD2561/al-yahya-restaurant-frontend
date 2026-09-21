import type { ReactNode } from 'react';
import { requireSession } from '@/core/auth/permissions';
import { SessionProvider } from '@/core/permissions/session-context';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();

  return (
    <SessionProvider
      session={{
        id: session.sub,
        nameEn: session.nameEn,
        nameAr: session.nameAr,
        email: session.email,
        roleId: session.roleId,
        roleType: session.roleType,
        permissionCodes: session.permissionCodes,
        preferredLanguage: session.preferredLanguage,
      }}
    >
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Topbar />
          <main className="flex flex-1 flex-col bg-zinc-50 p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
