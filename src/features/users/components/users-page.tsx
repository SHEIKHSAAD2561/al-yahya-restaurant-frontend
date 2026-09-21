'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { useRolesQuery } from '@/features/roles/hooks/use-roles-query';
import { useUsersQuery } from '../hooks/use-users-query';
import { UserFiltersBar } from './user-filters-bar';
import { UserListTable } from './user-list-table';
import { UserDrawerForm } from './user-drawer-form';
import type { User } from '../types/user';
import type { UsersQuery } from '../api/users.api';

export function UsersPage() {
  const t = useTranslations('settings.users');
  const canManage = usePermission(PERMISSIONS.SETTINGS_USERS_MANAGE);

  const [filters, setFilters] = useState<UsersQuery>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const usersQuery = useUsersQuery(filters);
  const rolesQuery = useRolesQuery();

  function openCreate() {
    setEditingUser(null);
    setDrawerOpen(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setDrawerOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">
          {t('title')}
          {usersQuery.data && (
            <span className="ms-2 text-sm font-normal text-zinc-400">
              ({usersQuery.data.length})
            </span>
          )}
        </h1>
        {canManage && (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            {t('addUser')}
          </Button>
        )}
      </div>

      <UserFiltersBar filters={filters} onChange={setFilters} roles={rolesQuery.data ?? []} />

      <UserListTable
        users={usersQuery.data ?? []}
        isLoading={usersQuery.isPending}
        onEdit={openEdit}
        canManage={canManage}
      />

      {canManage && (
        <UserDrawerForm open={drawerOpen} onOpenChange={setDrawerOpen} user={editingUser} />
      )}
    </div>
  );
}
