'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useDisplayName } from '@/core/permissions/session-context';
import { useLogout } from '@/features/auth/hooks/use-logout';

export function UserMenu() {
  const displayName = useDisplayName();
  const logout = useLogout();
  const t = useTranslations('auth');

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full py-1 pe-3 ps-1 hover:bg-zinc-100"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-brand-muted text-sm font-semibold text-brand">
            {displayName.slice(0, 1).toUpperCase()}
          </span>
          <span className="hidden text-start text-sm sm:block">
            <span className="block font-medium text-zinc-900">{displayName}</span>
          </span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-40 rounded-lg border border-zinc-200 bg-white p-1 shadow-md"
        >
          <DropdownMenu.Item
            onSelect={() => void logout()}
            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100 data-[highlighted]:bg-zinc-100"
          >
            <LogOut className="size-4" />
            {t('signOut')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
