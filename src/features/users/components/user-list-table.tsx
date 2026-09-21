'use client';

import { MoreHorizontal, Pencil, Users as UsersIcon } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useLocale, useTranslations } from 'next-intl';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { UserStatusBadge } from './user-status-badge';
import { useUpdateUserStatusMutation } from '../hooks/use-update-user-status-mutation';
import { USER_STATUSES, type User } from '../types/user';

interface UserListTableProps {
  users: User[];
  isLoading: boolean;
  onEdit: (user: User) => void;
  canManage: boolean;
}

export function UserListTable({ users, isLoading, onEdit, canManage }: UserListTableProps) {
  const t = useTranslations('settings.users');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const updateStatusMutation = useUpdateUserStatusMutation();

  if (isLoading) {
    return (
      <Table>
        <TableBody>
          {Array.from({ length: 4 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell colSpan={4}>
                <Skeleton className="h-6 w-full" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (users.length === 0) {
    return (
      <Table>
        <TableBody>
          <TableRow>
            <TableCell colSpan={4} className="p-0">
              <EmptyState icon={UsersIcon} title={tCommon('noResults')} />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeaderCell>{t('name')}</TableHeaderCell>
          <TableHeaderCell>{t('role')}</TableHeaderCell>
          <TableHeaderCell>{t('status')}</TableHeaderCell>
          {canManage && <TableHeaderCell className="w-10" />}
        </tr>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="font-medium text-zinc-900">
                {locale === 'ar' ? user.nameAr : user.nameEn}
              </div>
              <div className="text-xs text-zinc-500">{user.email}</div>
            </TableCell>
            <TableCell>{locale === 'ar' ? user.role.nameAr : user.role.nameEn}</TableCell>
            <TableCell>
              <UserStatusBadge status={user.status} />
            </TableCell>
            {canManage && (
            <TableCell>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                    aria-label="Row actions"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={6}
                    className="z-50 min-w-40 rounded-lg border border-zinc-200 bg-white p-1 shadow-md"
                  >
                    <DropdownMenu.Item
                      onSelect={() => onEdit(user)}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100 data-[highlighted]:bg-zinc-100"
                    >
                      <Pencil className="size-4" />
                      {tCommon('edit')}
                    </DropdownMenu.Item>
                    {user.status === USER_STATUSES.ACTIVE && (
                      <DropdownMenu.Item
                        onSelect={() =>
                          updateStatusMutation.mutate({
                            id: user.id,
                            status: USER_STATUSES.INACTIVE,
                          })
                        }
                        className="cursor-pointer rounded-md px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50 data-[highlighted]:bg-red-50"
                      >
                        {t('deactivate')}
                      </DropdownMenu.Item>
                    )}
                    {user.status === USER_STATUSES.INACTIVE && (
                      <DropdownMenu.Item
                        onSelect={() =>
                          updateStatusMutation.mutate({
                            id: user.id,
                            status: USER_STATUSES.ACTIVE,
                          })
                        }
                        className="cursor-pointer rounded-md px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100 data-[highlighted]:bg-zinc-100"
                      >
                        {t('activate')}
                      </DropdownMenu.Item>
                    )}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
