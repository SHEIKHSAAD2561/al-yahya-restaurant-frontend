'use client';

import { useState } from 'react';
import { Landmark, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
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
import { useFixedAssetsQuery } from '../hooks/use-fixed-assets-query';
import { useDeleteFixedAssetMutation, useDisposeFixedAssetMutation } from '../hooks/use-fixed-asset-mutations';
import type { FixedAsset } from '../types/fixed-asset';
import { FixedAssetDialog } from './fixed-asset-dialog';
import { RecordDepreciationDialog } from './record-depreciation-dialog';

function formatCurrency(value: number): string {
  return `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`;
}

export function FixedAssetsPage() {
  const t = useTranslations('fixedAssets');
  const tCommon = useTranslations('common');
  const canManage = usePermission(PERMISSIONS.ACCOUNTING_MANAGE_FIXED_ASSETS);
  const assetsQuery = useFixedAssetsQuery();
  const disposeMutation = useDisposeFixedAssetMutation();
  const deleteMutation = useDeleteFixedAssetMutation();

  const [editing, setEditing] = useState<FixedAsset | null | undefined>(undefined);
  const [depreciating, setDepreciating] = useState<FixedAsset | null>(null);
  const [disposing, setDisposing] = useState<FixedAsset | null>(null);
  const [deleting, setDeleting] = useState<FixedAsset | null>(null);

  const assets = assetsQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">{t('title')}</h1>
        {canManage && (
          <Button onClick={() => setEditing(null)}>
            <Plus className="size-4" />
            {t('newAsset')}
          </Button>
        )}
      </div>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>{t('name')}</TableHeaderCell>
            <TableHeaderCell>{t('category')}</TableHeaderCell>
            <TableHeaderCell>{t('purchaseCost')}</TableHeaderCell>
            <TableHeaderCell>{t('accumulatedDepreciation')}</TableHeaderCell>
            <TableHeaderCell>{t('bookValue')}</TableHeaderCell>
            <TableHeaderCell>{t('status')}</TableHeaderCell>
            {canManage && <TableHeaderCell className="w-16" />}
          </tr>
        </TableHead>
        <TableBody>
          {assetsQuery.isPending ? (
            Array.from({ length: 4 }, (_, index) => (
              <TableRow key={index}>
                <TableCell colSpan={7}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : assets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="p-0">
                <EmptyState icon={Landmark} title={tCommon('noResults')} />
              </TableCell>
            </TableRow>
          ) : (
            assets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell className="font-medium text-zinc-900">{asset.name}</TableCell>
                <TableCell>{asset.category ?? ''}</TableCell>
                <TableCell>{formatCurrency(asset.purchaseCost)}</TableCell>
                <TableCell>{formatCurrency(asset.accumulatedDepreciation)}</TableCell>
                <TableCell>{formatCurrency(asset.bookValue)}</TableCell>
                <TableCell>
                  <Badge variant={asset.status === 'ACTIVE' ? 'success' : 'neutral'}>
                    {t(`statuses.${asset.status}`)}
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
                          className="z-50 min-w-44 rounded-lg border border-zinc-200 bg-white p-1 shadow-md"
                        >
                          <DropdownMenu.Item
                            onSelect={() => setEditing(asset)}
                            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-zinc-50"
                          >
                            {tCommon('edit')}
                          </DropdownMenu.Item>
                          {asset.status === 'ACTIVE' && (
                            <>
                              <DropdownMenu.Item
                                onSelect={() => setDepreciating(asset)}
                                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-zinc-50"
                              >
                                {t('recordDepreciation')}
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                onSelect={() => setDisposing(asset)}
                                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-zinc-50"
                              >
                                {t('dispose')}
                              </DropdownMenu.Item>
                            </>
                          )}
                          {asset.accumulatedDepreciation === 0 && (
                            <DropdownMenu.Item
                              onSelect={() => setDeleting(asset)}
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
            ))
          )}
        </TableBody>
      </Table>

      {editing !== undefined && (
        <FixedAssetDialog key={editing?.id ?? 'new'} asset={editing} open onOpenChange={(open) => !open && setEditing(undefined)} />
      )}

      <RecordDepreciationDialog asset={depreciating} open={depreciating !== null} onOpenChange={(open) => !open && setDepreciating(null)} />

      <Dialog open={disposing !== null} onOpenChange={(open) => !open && setDisposing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('disposeConfirmTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-600">{t('disposeConfirmDescription')}</p>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDisposing(null)}>
              {tCommon('cancel')}
            </Button>
            <Button
              type="button"
              disabled={disposeMutation.isPending}
              onClick={() =>
                disposing &&
                disposeMutation.mutate(
                  { id: disposing.id, disposalDate: new Date().toISOString().slice(0, 10) },
                  { onSuccess: () => setDisposing(null) },
                )
              }
            >
              {t('dispose')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
