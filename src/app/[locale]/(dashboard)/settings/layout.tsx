import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { SETTINGS_TABS } from '@/core/nav/nav-config';
import { SettingsTabs } from '@/components/layout/settings-tabs';

export default async function SettingsLayout({ children }: { children: ReactNode }) {
  const session = await requirePermission(PERMISSIONS.SETTINGS_ACCESS);
  const t = await getTranslations('settings.tabs');

  const visibleTabs = SETTINGS_TABS.filter((tab) =>
    session.permissionCodes.includes(tab.permission),
  ).map((tab) => ({ href: tab.href, label: t(tab.labelKey) }));

  return (
    <div className="flex flex-1 flex-col gap-6">
      <SettingsTabs tabs={visibleTabs} />
      {children}
    </div>
  );
}
