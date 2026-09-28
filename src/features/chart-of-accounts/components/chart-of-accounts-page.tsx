'use client';

import { useState } from 'react';
import { Lock, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { useAccountsQuery } from '../hooks/use-accounts-query';
import { useDeleteAccountMutation, useToggleAccountStatusMutation } from '../hooks/use-account-mutations';
import { ACCOUNT_TYPES, type Account } from '../types/account';
import { AccountDialog } from './account-dialog';

export function ChartOfAccountsPage() {
  const t = useTranslations('chartOfAccounts');
  const tCommon = useTranslations('common');
  const canManage = usePermission(PERMISSIONS.ACCOUNTING_MANAGE_CHART_OF_ACCOUNTS);
  const accountsQuery = useAccountsQuery();
  const toggleMutation = useToggleAccountStatusMutation();
  const deleteMutation = useDeleteAccountMutation();

  const [editing, setEditing] = useState<Account | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Account | null>(null);

  const accounts = accountsQuery.data ?? [];
  const grouped = Object.values(ACCOUNT_TYPES).map((type) => ({
    type,
    accounts: accounts.filter((account) => account.type === type),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">{t('title')}</h1>
        {canManage && (
          <Button onClick={() => setEditing(null)}>
            <Plus className="size-4" />
            {t('newAccount')}
          </Button>
        )}
      </div>

      {accountsQuery.isPending ? (
        <Skeleton className="h-96 w-full" />
      ) : accounts.length === 0 ? (
        <EmptyState icon={Lock} title={tCommon('noResults')} />
      ) : (
        <div className="space-y-6">
          {grouped.map(
            (group) =>
              group.accounts.length > 0 && (
                <div key={group.type} className="rounded-2xl border border-zinc-200 bg-white">
                  <div className="border-b border-zinc-100 px-4 py-3">
                    <h2 className="text-sm font-semibold text-zinc-900">{t(`types.${group.type}`)}</h2>
                  </div>
                  <Table>
                    <TableHead>
                      <tr>
                        <TableHeaderCell>{t('code')}</TableHeaderCell>
                        <TableHeaderCell>{t('name')}</TableHeaderCell>
                        <TableHeaderCell>{t('status')}</TableHeaderCell>
                        {canManage && <TableHeaderCell className="w-16" />}
                      </tr>
                    </TableHead>
                    <TableBody>
                      {group.accounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium text-zinc-900">{account.code}</TableCell>
                          <TableCell>
                            {account.name}
                            {account.isSystem && (
                              <Lock className="ms-2 inline size-3.5 text-zinc-400" aria-label={t('systemAccount')} />
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={account.isActive ? 'success' : 'neutral'}>
                              {account.isActive ? t('active') : t('inactive')}
                            </Badge>
                          </TableCell>
                          {canManage && (
                            <TableCell>
                              <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                  <button
                                    type="button"
                                    aria-label={tCommon('edit')}
                                    className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
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
                                      onSelect={() => setEditing(account)}
                                      className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-zinc-50"
                                    >
                                      {tCommon('edit')}
                                    </DropdownMenu.Item>
                                    {!account.isSystem && (
                                      <DropdownMenu.Item
                                        onSelect={() => toggleMutation.mutate({ id: account.id, isActive: !account.isActive })}
                                        className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-zinc-50"
                                      >
                                        {account.isActive ? t('deactivate') : t('activate')}
                                      </DropdownMenu.Item>
                                    )}
                                    {!account.isSystem && (
                                      <DropdownMenu.Item
                                        onSelect={() => setDeleting(account)}
                                        className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 outline-none data-[highlighted]:bg-red-50"
                                      >
                                        <Trash2 className="size-4" />
                                        {tCommon('delete')}
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
                </div>
              ),
          )}
        </div>
      )}

      {editing !== undefined && (
        <AccountDialog key={editing?.id ?? 'new'} account={editing} open onOpenChange={(open) => !open && setEditing(undefined)} />
      )}

      <Dialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteConfirmTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-600">{t('deleteConfirmDescription')}</p>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDeleting(null)}>
              {tCommon('cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleting && deleteMutation.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
            >
              {tCommon('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
