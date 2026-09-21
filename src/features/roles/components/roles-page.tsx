'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { usePermission, useSession } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { ROLE_TYPES } from '@/core/auth/role-type';
import { useRolesQuery } from '../hooks/use-roles-query';
import { useDeleteRoleMutation } from '../hooks/use-delete-role-mutation';
import { RoleCardGrid } from './role-card-grid';
import { RoleViewSheet } from './role-view-sheet';
import { CreateRoleDialog } from './create-role-dialog';
import type { Role } from '../types/role';

export function RolesPage() {
  const t = useTranslations('settings.roles');
  const session = useSession();
  const canManage = usePermission(PERMISSIONS.SETTINGS_ROLES_MANAGE);
  const isSuperAdmin = session.roleType === ROLE_TYPES.SUPER_ADMIN;

  const rolesQuery = useRolesQuery();
  const deleteRoleMutation = useDeleteRoleMutation();

  const [viewingRole, setViewingRole] = useState<Role | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  function openView(role: Role) {
    setViewingRole(role);
    setSheetOpen(true);
  }

  function handleDelete(role: Role) {
    if (window.confirm(t('confirmDelete'))) {
      deleteRoleMutation.mutate(role.id);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">{t('title')}</h1>
        {canManage && isSuperAdmin && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            {t('createRole')}
          </Button>
        )}
      </div>

      <RoleCardGrid
        roles={rolesQuery.data ?? []}
        canDelete={canManage && isSuperAdmin}
        onView={openView}
        onDelete={handleDelete}
      />

      <RoleViewSheet
        role={viewingRole}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        canManage={canManage}
      />
      {canManage && isSuperAdmin && (
        <CreateRoleDialog open={createOpen} onOpenChange={setCreateOpen} />
      )}
    </div>
  );
}
