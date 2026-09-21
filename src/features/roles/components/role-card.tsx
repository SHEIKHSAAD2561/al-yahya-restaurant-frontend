'use client';

import { ShieldCheck, UserCog, Lock, MoreHorizontal, Trash2 } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTranslations } from 'next-intl';
import type { Role } from '../types/role';

interface RoleCardProps {
  role: Role;
  canDelete: boolean;
  onView: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export function RoleCard({ role, canDelete, onView, onDelete }: RoleCardProps) {
  const t = useTranslations('settings.roles');
  const Icon = role.isLocked ? ShieldCheck : UserCog;
  const showDeleteMenu = canDelete && role.isDeletable;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView(role)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onView(role);
      }}
      className="flex cursor-pointer flex-col items-start rounded-2xl border border-zinc-200 bg-white p-5 text-start transition-colors hover:border-brand"
    >
      <div className="flex w-full items-start justify-between">
        <span className="flex size-9 items-center justify-center rounded-xl bg-brand-muted text-brand">
          <Icon className="size-4" />
        </span>
        <div onClick={(event) => event.stopPropagation()}>
          {role.isLocked ? (
            <Lock className="size-4 text-zinc-300" />
          ) : (
            showDeleteMenu && (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100"
                    aria-label="Role actions"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={6}
                    className="z-50 min-w-36 rounded-lg border border-zinc-200 bg-white p-1 shadow-md"
                  >
                    <DropdownMenu.Item
                      onSelect={() => onDelete(role)}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50 data-[highlighted]:bg-red-50"
                    >
                      <Trash2 className="size-4" />
                      {t('deleteRole')}
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            )
          )}
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold text-zinc-900">{role.name}</p>
    </div>
  );
}
