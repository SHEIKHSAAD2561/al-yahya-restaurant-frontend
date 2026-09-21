'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/core/i18n/navigation';
import { NAV_ITEMS } from '@/core/nav/nav-config';
import { useSession } from '@/core/permissions/session-context';
import { cn } from '@/lib/utils';
import { BrandMark } from './brand-mark';

export function Sidebar() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const pathname = usePathname();
  const session = useSession();

  const items = NAV_ITEMS.filter(
    (item) => item.permission === null || session.permissionCodes.includes(item.permission),
  );

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-16 items-center gap-3 px-5">
        <BrandMark />
        <span className="truncate text-sm font-semibold text-white">{tCommon('appName')}</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-active text-white shadow-sm'
                  : 'text-sidebar-foreground/80 hover:bg-white/5 hover:text-white',
              )}
            >
              <Icon className={cn('size-4 shrink-0', isActive && 'text-accent')} />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
