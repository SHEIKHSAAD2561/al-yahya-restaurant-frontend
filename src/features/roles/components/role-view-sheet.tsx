'use client';

import { useState } from 'react';
import { Check, Minus, ShieldCheck, UserCog } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody } from '@/components/ui/sheet';
import { useRouter } from '@/core/i18n/navigation';
import { PERMISSIONS, PERMISSION_MODULES, type PermissionModule } from '@/core/permissions/codes';
import { usePermission } from '@/core/permissions/session-context';
import { usePermissionsQuery } from '@/features/permissions/hooks/use-permissions-query';
import { PermissionModuleRail } from '@/features/permissions/components/permission-module-rail';
import { useUsersQuery } from '@/features/users/hooks/use-users-query';
import { AssignRoleDialog } from './assign-role-dialog';
import type { Role } from '../types/role';

interface RoleViewSheetProps {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canManage: boolean;
}

export function RoleViewSheet({ role, open, onOpenChange, canManage }: RoleViewSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-2xl">
        {/* Keyed by role id so switching roles starts on a fresh tab/module
         * instead of a reset Effect — see https://react.dev/learn/you-might-not-need-an-effect. */}
        {role && <RoleViewSheetBody key={role.id} role={role} canManage={canManage} />}
      </SheetContent>
    </Sheet>
  );
}

function RoleViewSheetBody({ role, canManage }: { role: Role; canManage: boolean }) {
  const t = useTranslations('settings.roles');
  const locale = useLocale();
  const router = useRouter();
  const [tab, setTab] = useState<'users' | 'permissions'>('permissions');
  const [activeModule, setActiveModule] = useState<PermissionModule>(PERMISSION_MODULES.POS);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const canManageUsers = usePermission(PERMISSIONS.SETTINGS_USERS_MANAGE);

  const permissionsQuery = usePermissionsQuery();
  const usersQuery = useUsersQuery({ roleId: role.id }, { enabled: tab === 'users' });

  const Icon = role.isLocked ? ShieldCheck : UserCog;
  const modulePermissions = permissionsQuery.data?.[activeModule] ?? [];

  function isModuleEnabled(module: PermissionModule): boolean {
    const codes = permissionsQuery.data?.[module] ?? [];
    return codes.some((permission) => role.permissionCodes.includes(permission.code));
  }

  return (
    <>
      <SheetHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-muted text-brand">
              <Icon className="size-5" />
            </span>
            <SheetTitle>{role.name}</SheetTitle>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={role.isLocked || !canManage}
              onClick={() => router.push(`/settings/roles/${role.id}`)}
            >
              {t('editPermissions')}
            </Button>
            {canManageUsers && (
              <Button variant="secondary" size="sm" onClick={() => setAssignDialogOpen(true)}>
                {t('assignToUsers')}
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-1 border-b border-zinc-200">
          {(['permissions', 'users'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                'border-b-2 px-3 pb-2.5 text-sm font-medium transition-colors',
                tab === value
                  ? 'border-brand text-brand'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800',
              )}
            >
              {value === 'permissions' ? t('permissionsTab') : t('usersTab')}
            </button>
          ))}
        </div>
      </SheetHeader>

      <SheetBody>
        {tab === 'permissions' ? (
          <div className="grid grid-cols-[220px_1fr] gap-6">
            <PermissionModuleRail
              activeModule={activeModule}
              onSelect={setActiveModule}
              isModuleEnabled={isModuleEnabled}
            />
            <div className="space-y-1 divide-y divide-zinc-100">
              {modulePermissions.length === 0 && (
                <p className="py-6 text-sm text-zinc-500">{t('noPermissionsInModule')}</p>
              )}
              {modulePermissions.map((permission) => {
                const granted = role.permissionCodes.includes(permission.code);
                return (
                  <div key={permission.code} className="flex items-start justify-between gap-4 py-3">
                    <p className="text-sm text-zinc-700">{permission.description}</p>
                    {granted ? (
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    ) : (
                      <Minus className="mt-0.5 size-4 shrink-0 text-zinc-300" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {usersQuery.isPending && (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            )}
            {usersQuery.data?.length === 0 && (
              <p className="py-6 text-center text-sm text-zinc-500">{t('noUsers')}</p>
            )}
            {usersQuery.data?.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {locale === 'ar' ? user.nameAr : user.nameEn}
                  </p>
                  <p className="text-xs text-zinc-500">{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SheetBody>

      {canManageUsers && (
        <AssignRoleDialog role={role} open={assignDialogOpen} onOpenChange={setAssignDialogOpen} />
      )}
    </>
  );
}
