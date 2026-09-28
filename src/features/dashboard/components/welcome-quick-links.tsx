import { getTranslations, getLocale } from 'next-intl/server';
import { Users, ShieldCheck, MapPin } from 'lucide-react';
import { Link } from '@/core/i18n/navigation';
import { getSession } from '@/core/auth/session';
import { PERMISSIONS } from '@/core/permissions/codes';

const QUICK_LINKS = [
  {
    href: '/settings/users',
    icon: Users,
    titleKey: 'users',
    descKey: 'manageUsers',
    permission: PERMISSIONS.SETTINGS_USERS_VIEW,
  },
  {
    href: '/settings/roles',
    icon: ShieldCheck,
    titleKey: 'roles',
    descKey: 'manageRoles',
    permission: PERMISSIONS.SETTINGS_ROLES_VIEW,
  },
  {
    href: '/settings/locations',
    icon: MapPin,
    titleKey: 'locations',
    descKey: 'manageLocations',
    permission: PERMISSIONS.SETTINGS_LOCATIONS_MANAGE,
  },
] as const;

/** Fallback for a signed-in user with no `dashboard.*` permission at all
 * (e.g. a Cashier role scoped to just `pos.*`) — Home has no permission gate
 * of its own (every signed-in user lands here), so it can't just redirect
 * away like other pages do when a permission is missing. */
export async function WelcomeQuickLinks() {
  const session = await getSession();
  const locale = await getLocale();
  const t = await getTranslations('dashboard');
  const tTabs = await getTranslations('settings.tabs');

  const visibleLinks = QUICK_LINKS.filter((link) => session?.permissionCodes.includes(link.permission));
  const displayName = session ? (locale === 'ar' ? session.nameAr : session.nameEn) : '';

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8">
        <h1 className="text-xl font-semibold text-zinc-900">{t('welcomeBack', { name: displayName })}</h1>
      </div>

      {visibleLinks.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-medium text-zinc-500">{t('quickLinks')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:border-brand"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-brand-muted text-brand">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-zinc-900">{tTabs(link.titleKey)}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{t(link.descKey)}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
