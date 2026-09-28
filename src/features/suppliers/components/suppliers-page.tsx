'use client';

import { useState } from 'react';
import { MoreHorizontal, Plus, Trash2, Truck } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { useSuppliersQuery } from '../hooks/use-suppliers-query';
import { useDeactivateSupplierMutation } from '../hooks/use-deactivate-supplier-mutation';
import { SupplierDialog } from './supplier-dialog';
import type { Supplier } from '../types/supplier';

function formatCurrency(value: number): string {
  return `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`;
}

export function SuppliersPage() {
  const t = useTranslations('suppliers');
  const tCommon = useTranslations('common');
  const canManage = usePermission(PERMISSIONS.PURCHASES_SUPPLIERS_MANAGE_SUPPLIERS_PAYABLES);

  const suppliersQuery = useSuppliersQuery();
  const deactivateMutation = useDeactivateSupplierMutation();
  const [editing, setEditing] = useState<Supplier | null | undefined>(undefined);
  const [deactivating, setDeactivating] = useState<Supplier | null>(null);

  const suppliers = suppliersQuery.data ?? [];
  const columnCount = 5 + (canManage ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        {canManage && (
          <Button onClick={() => setEditing(null)}>
            <Plus className="size-4" />
            {t('addSupplier')}
          </Button>
        )}
      </div>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>{t('name')}</TableHeaderCell>
            <TableHeaderCell>{t('phone')}</TableHeaderCell>
            <TableHeaderCell>{t('email')}</TableHeaderCell>
            <TableHeaderCell>{t('balance')}</TableHeaderCell>
            <TableHeaderCell>{tCommon('active')}</TableHeaderCell>
            {canManage && <TableHeaderCell className="w-16" />}
          </tr>
        </TableHead>
        <TableBody>
          {suppliersQuery.isPending ? (
            Array.from({ length: 4 }, (_, index) => (
              <TableRow key={index}>
                <TableCell colSpan={columnCount}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : suppliers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnCount} className="p-0">
                <EmptyState icon={Truck} title={t('empty')} />
              </TableCell>
            </TableRow>
          ) : (
            suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>
                  {canManage ? (
                    <button
                      type="button"
                      onClick={() => setEditing(supplier)}
                      className="font-medium text-brand hover:underline"
                    >
                      {supplier.name}
                    </button>
                  ) : (
                    <span className="font-medium text-zinc-900">{supplier.name}</span>
                  )}
                </TableCell>
                <TableCell dir="ltr" className="rtl:text-end">
                  {supplier.phone ?? ''}
                </TableCell>
                <TableCell>{supplier.email ?? ''}</TableCell>
                <TableCell className={supplier.balance > 0 ? 'font-medium text-red-600' : ''}>
                  {formatCurrency(supplier.balance)}
                </TableCell>
                <TableCell>
                  <Badge variant={supplier.isActive ? 'success' : 'neutral'}>
                    {tCommon(supplier.isActive ? 'active' : 'inactive')}
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
                          className="z-50 min-w-36 rounded-lg border border-zinc-200 bg-white p-1 shadow-md"
                        >
                          <DropdownMenu.Item
                            onSelect={() => setEditing(supplier)}
                            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-zinc-50"
                          >
                            {tCommon('edit')}
                          </DropdownMenu.Item>
                          {supplier.isActive && (
                            <DropdownMenu.Item
                              onSelect={() => setDeactivating(supplier)}
                              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 outline-none data-[highlighted]:bg-red-50"
                            >
                              <Trash2 className="size-4" />
                              {t('deactivate')}
                            </DropdownMenu.Item>
                          )}
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {editing !== undefined && (
        <SupplierDialog
          key={editing?.id ?? 'new'}
          open={editing !== undefined}
          supplier={editing}
          onOpenChange={(open) => !open && setEditing(undefined)}
        />
      )}

      <Dialog open={deactivating !== null} onOpenChange={(open) => !open && setDeactivating(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deactivateConfirmTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-600">{t('deactivateConfirmDescription')}</p>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDeactivating(null)}>
              {tCommon('cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deactivateMutation.isPending}
              onClick={() =>
                deactivating && deactivateMutation.mutate(deactivating.id, { onSuccess: () => setDeactivating(null) })
              }
            >
              {t('deactivate')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
