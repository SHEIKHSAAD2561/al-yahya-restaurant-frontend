'use client';

import { useState } from 'react';
import { ChevronDown, Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/core/i18n/navigation';
import { NAV_ENTRIES, type NavGroup, type NavLink } from '@/core/nav/nav-config';
import { useSession } from '@/core/permissions/session-context';
import { cn } from '@/lib/utils';
import { BrandMark } from './brand-mark';

const COLLAPSE_STORAGE_KEY = 'sidebar-collapsed';

function isActiveHref(pathname: string, href: string): boolean {
  return pathname === href || (href !== '/' && pathname.startsWith(href));
}

export function Sidebar({ logoUrl }: { logoUrl?: string | null }) {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const pathname = usePathname();
  const session = useSession();

  // Per-viewer convenience only (never shared, never read by the server).
  // Read lazily on first render rather than in an effect, so there's no
  // flash of the wrong width. `localStorage` is undefined during the
  // server-rendered pass (caught below, falls back to expanded); if the
  // stored preference is "collapsed", the client's first hydrated render
  // can briefly disagree with that server HTML — an accepted tradeoff for
  // this purely cosmetic preference.
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
      } catch {
        // ignore — the toggle still works for this render, just won't persist
      }
      return next;
    });
  }

  function hasPermission(permission: string | null): boolean {
    return permission === null || session.permissionCodes.includes(permission);
  }

  return (
    <aside
      className={cn(
        'hidden shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex h-16 items-center gap-2 px-3">
        <button
          type="button"
          onClick={toggleCollapsed}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/70 hover:bg-white/5 hover:text-white"
          aria-label={collapsed ? t('expandSidebar') : t('collapseSidebar')}
        >
          <Menu className="size-5" />
        </button>
        {!collapsed && (
          <div className="flex min-w-0 items-center gap-2">
            <BrandMark logoUrl={logoUrl} />
            <span className="truncate text-sm font-semibold text-white">{tCommon('appName')}</span>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-2">
        {NAV_ENTRIES.map((entry) => {
          if (entry.type === 'link') {
            if (!hasPermission(entry.permission)) return null;
            return (
              <LeafRow
                key={entry.href}
                entry={entry}
                collapsed={collapsed}
                isActive={isActiveHref(pathname, entry.href)}
                label={t(entry.labelKey)}
              />
            );
          }

          const visibleChildren = entry.children.filter((child) => hasPermission(child.permission));
          if (visibleChildren.length === 0) return null;

          return (
            <GroupRow
              key={entry.labelKey}
              group={entry}
              visibleChildren={visibleChildren}
              collapsed={collapsed}
              pathname={pathname}
              onExpandSidebar={() => setCollapsed(false)}
            />
          );
        })}
      </nav>
    </aside>
  );
}

function LeafRow({
  entry,
  collapsed,
  isActive,
  label,
}: {
  entry: NavLink;
  collapsed: boolean;
  isActive: boolean;
  label: string;
}) {
  const Icon = entry.icon;
  return (
    <Link
      href={entry.href}
      title={collapsed ? label : undefined}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        collapsed && 'justify-center px-0',
        isActive
          ? 'bg-sidebar-active text-white shadow-sm'
          : 'text-sidebar-foreground/80 hover:bg-white/5 hover:text-white',
      )}
    >
      <Icon className={cn('size-4 shrink-0', isActive && 'text-accent')} />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

function GroupRow({
  group,
  visibleChildren,
  collapsed,
  pathname,
  onExpandSidebar,
}: {
  group: NavGroup;
  visibleChildren: NavLink[];
  collapsed: boolean;
  pathname: string;
  onExpandSidebar: () => void;
}) {
  const t = useTranslations('nav');
  const containsActiveRoute = visibleChildren.some((child) => isActiveHref(pathname, child.href));
  const [open, setOpen] = useState(containsActiveRoute);
  const Icon = group.icon;
  const label = t(group.labelKey);

  if (collapsed) {
    return (
      <button
        type="button"
        title={label}
        onClick={() => {
          onExpandSidebar();
          setOpen(true);
        }}
        className={cn(
          'flex w-full items-center justify-center rounded-lg px-0 py-2.5 transition-colors',
          containsActiveRoute
            ? 'bg-sidebar-active text-white shadow-sm'
            : 'text-sidebar-foreground/80 hover:bg-white/5 hover:text-white',
        )}
      >
        <Icon className={cn('size-4 shrink-0', containsActiveRoute && 'text-accent')} />
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-white/5 hover:text-white"
      >
        <Icon className="size-4 shrink-0" />
        <span className="flex-1 truncate text-start">{label}</span>
        <ChevronDown className={cn('size-4 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="ms-4 mt-1 space-y-1 border-s border-white/10 ps-3">
          {visibleChildren.map((child) => (
            <LeafRow
              key={child.href}
              entry={child}
              collapsed={false}
              isActive={isActiveHref(pathname, child.href)}
              label={t(child.labelKey)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
