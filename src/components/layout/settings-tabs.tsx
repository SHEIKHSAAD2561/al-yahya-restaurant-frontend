'use client';

import { Link, usePathname } from '@/core/i18n/navigation';
import { cn } from '@/lib/utils';

interface Tab {
  href: string;
  label: string;
}

export function SettingsTabs({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();

  return (
    <div className="border-b border-zinc-200">
      <nav className="-mb-px flex gap-6">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'border-b-2 px-1 pb-3 text-sm font-medium transition-colors',
                isActive
                  ? 'border-brand text-brand'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800',
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
