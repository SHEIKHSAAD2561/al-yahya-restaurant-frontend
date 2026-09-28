import { getSession } from '@/core/auth/session';
import { PERMISSIONS } from '@/core/permissions/codes';
import { DashboardPage } from '@/features/dashboard/components/dashboard-page';
import { WelcomeQuickLinks } from '@/features/dashboard/components/welcome-quick-links';

/**
 * Home has no permission gate of its own — every signed-in user lands here,
 * so unlike other pages it can't `requirePermission()` and redirect away on
 * a miss (that would redirect `/` to itself). Instead it branches: a user
 * with `dashboard.access` gets the real dashboard (which further trims its
 * own sections by the finer `dashboard.*` permissions); anyone else gets the
 * original simple welcome + quick-links view.
 */
export default async function DashboardHomePage() {
  const session = await getSession();
  const canViewDashboard = session?.permissionCodes.includes(PERMISSIONS.DASHBOARD_ACCESS) ?? false;

  return canViewDashboard ? <DashboardPage /> : <WelcomeQuickLinks />;
}
