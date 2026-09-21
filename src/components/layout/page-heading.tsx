'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from '@/core/i18n/navigation';
import { NAV_ITEMS, SETTINGS_TABS } from '@/core/nav/nav-config';

export function PageHeading() {
  const pathname = usePathname();
  const tNav = useTranslations('nav');
  const tSettingsTabs = useTranslations('settings.tabs');

  const settingsTab = SETTINGS_TABS.find(
    (tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`),
  );
  if (settingsTab) {
    return (
      <h2 className="text-sm font-medium text-zinc-500">
        {tNav('settings')} <span className="mx-1 text-zinc-300">/</span>{' '}
        <span className="text-zinc-900">{tSettingsTabs(settingsTab.labelKey)}</span>
      </h2>
    );
  }

  const navItem = NAV_ITEMS.find(
    (item) => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)),
  );
  if (navItem) {
    return <h2 className="text-sm font-medium text-zinc-900">{tNav(navItem.labelKey)}</h2>;
  }

  return null;
}
