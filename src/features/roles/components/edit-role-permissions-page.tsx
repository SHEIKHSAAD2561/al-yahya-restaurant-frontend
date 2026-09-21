'use client';

import { useEffect, useState } from 'react';
import { UserCog } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from '@/core/i18n/navigation';
import { PERMISSION_MODULES, type PermissionModule } from '@/core/permissions/codes';
import { usePermissionsQuery } from '@/features/permissions/hooks/use-permissions-query';
import { PermissionModuleRail } from '@/features/permissions/components/permission-module-rail';
import { useRoleQuery } from '../hooks/use-role-query';
import { useUpdateRolePermissionsMutation } from '../hooks/use-update-role-permissions-mutation';

export function EditRolePermissionsPage({ roleId }: { roleId: string }) {
  const t = useTranslations('settings.roles');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const roleQuery = useRoleQuery(roleId);
  const permissionsQuery = usePermissionsQuery();
  const updatePermissionsMutation = useUpdateRolePermissionsMutation();

  const [activeModule, setActiveModule] = useState<PermissionModule>(PERMISSION_MODULES.POS);
  const [selectedCodes, setSelectedCodes] = useState<Set<string> | null>(null);
  // Adjust state during render when fresh role data arrives, per React's
  // guidance, instead of an Effect (https://react.dev/learn/you-might-not-need-an-effect).
  const [loadedRoleId, setLoadedRoleId] = useState<string | null>(null);
  if (roleQuery.data && loadedRoleId !== roleQuery.data.id) {
    setLoadedRoleId(roleQuery.data.id);
    setSelectedCodes(new Set(roleQuery.data.permissionCodes));
  }

  useEffect(() => {
    if (roleQuery.data?.isLocked) {
      router.replace('/settings/roles');
    }
  }, [roleQuery.data, router]);

  if (roleQuery.isPending || !selectedCodes) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const role = roleQuery.data;
  if (!role || role.isLocked) return null;

  const Icon = UserCog;
  const modulePermissions = permissionsQuery.data?.[activeModule] ?? [];

  function isModuleEnabled(module: PermissionModule): boolean {
    const codes = permissionsQuery.data?.[module] ?? [];
    return codes.some((permission) => selectedCodes!.has(permission.code));
  }

  function toggleCode(code: string, checked: boolean) {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (checked) next.add(code);
      else next.delete(code);
      return next;
    });
  }

  function enableAll() {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      for (const permission of modulePermissions) next.add(permission.code);
      return next;
    });
  }

  function handleSave() {
    updatePermissionsMutation.mutate(
      { id: roleId, permissionCodes: Array.from(selectedCodes!) },
      { onSuccess: () => router.push('/settings/roles') },
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">{t('editRolePermissions')}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/settings/roles')}>
            {tCommon('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={updatePermissionsMutation.isPending}>
            {t('saveChanges')}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-muted text-brand">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-zinc-900">{role.name}</p>
          <p className="text-sm text-zinc-500">{t('rolePermissionsDescription')}</p>
        </div>
      </div>

      <div className="grid grid-cols-[240px_1fr] gap-6">
        <PermissionModuleRail
          activeModule={activeModule}
          onSelect={setActiveModule}
          isModuleEnabled={isModuleEnabled}
        />

        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              {modulePermissions.length} {t('permissionsTab').toLowerCase()}
            </p>
            {modulePermissions.length > 0 && (
              <Button variant="outline" size="sm" onClick={enableAll}>
                {t('enableAll')}
              </Button>
            )}
          </div>

          <div className="divide-y divide-zinc-100">
            {modulePermissions.length === 0 && (
              <p className="py-6 text-sm text-zinc-500">{t('noPermissionsInModule')}</p>
            )}
            {modulePermissions.map((permission) => (
              <div key={permission.code} className="flex items-center justify-between gap-4 py-3.5">
                <p className="text-sm text-zinc-800">{permission.description}</p>
                <Switch
                  checked={selectedCodes.has(permission.code)}
                  onCheckedChange={(checked) => toggleCode(permission.code, checked)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
