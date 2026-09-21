'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Globe } from 'lucide-react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/core/i18n/navigation';

const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  ar: 'العربية',
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100"
          aria-label="Change language"
        >
          <Globe className="size-4" />
          {LOCALE_LABELS[locale] ?? locale}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-32 rounded-lg border border-zinc-200 bg-white p-1 shadow-md"
        >
          {Object.entries(LOCALE_LABELS).map(([code, label]) => (
            <DropdownMenu.Item
              key={code}
              onSelect={() => switchTo(code)}
              className="cursor-pointer rounded-md px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100 data-[highlighted]:bg-zinc-100"
            >
              {label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
