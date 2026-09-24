'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useUsersQuery } from '@/features/users/hooks/use-users-query';
import { ROLE_TYPES } from '@/core/auth/role-type';
import { useAssignRoleMutation } from '../hooks/use-assign-role-mutation';
import type { Role } from '../types/role';

interface AssignRoleDialogProps {
  role: Role;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignRoleDialog({ role, open, onOpenChange }: AssignRoleDialogProps) {
  const t = useTranslations('settings.roles');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const usersQuery = useUsersQuery({}, { enabled: open });
  const assignRoleMutation = useAssignRoleMutation();

  // Users who don't already have this role, and never the Super Admin
  // account — its role can't be reassigned (the backend rejects it too, this
  // just avoids offering a dead-end action).
  const candidates = useMemo(
    () =>
      (usersQuery.data ?? []).filter(
        (user) => user.roleId !== role.id && user.role.type !== ROLE_TYPES.SUPER_ADMIN,
      ),
    [usersQuery.data, role.id],
  );

  const filtered = useMemo(() => {
    if (!search) return candidates;
    const query = search.toLowerCase();
    return candidates.filter(
      (user) =>
        user.nameEn.toLowerCase().includes(query) ||
        user.nameAr.includes(search) ||
        user.email.toLowerCase().includes(query),
    );
  }, [candidates, search]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAssign() {
    assignRoleMutation.mutate(
      { userIds: Array.from(selected), roleId: role.id },
      {
        onSuccess: () => {
          setSelected(new Set());
          setSearch('');
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {t('assignToUsers')} — {role.name}
          </DialogTitle>
        </DialogHeader>

        <div className="relative mb-3">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            className="ps-9"
            placeholder={t('searchUsersPlaceholder')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="max-h-80 space-y-1 overflow-y-auto">
          {usersQuery.isPending && (
            <p className="py-6 text-center text-sm text-zinc-500">{tCommon('loading')}</p>
          )}
          {!usersQuery.isPending && filtered.length === 0 && (
            <p className="py-6 text-center text-sm text-zinc-500">{tCommon('noResults')}</p>
          )}
          {filtered.map((user) => (
            <label
              key={user.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-zinc-50"
            >
              <Checkbox checked={selected.has(user.id)} onCheckedChange={() => toggle(user.id)} />
              <span>
                <span className="block text-sm font-medium text-zinc-900">
                  {locale === 'ar' ? user.nameAr : user.nameEn}
                </span>
                <span className="block text-xs text-zinc-500">{user.email}</span>
              </span>
            </label>
          ))}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon('cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={selected.size === 0 || assignRoleMutation.isPending}
          >
            {t('assignToUsers')}
            {selected.size > 0 && ` (${selected.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
