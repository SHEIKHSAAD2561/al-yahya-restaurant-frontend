'use client';

import { useState } from 'react';
import { MoreHorizontal, NotebookPen, Plus, Trash2 } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { Link } from '@/core/i18n/navigation';
import { usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { useJournalEntriesQuery } from '../hooks/use-journal-entries-query';
import { useDeleteJournalEntryMutation, usePostJournalEntryMutation } from '../hooks/use-journal-entry-mutations';
import { JOURNAL_ENTRY_STATUSES, type JournalEntryListItem, type JournalEntryStatus } from '../types/journal-entry';

const ALL = 'ALL';

function formatCurrency(value: number): string {
  return `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`;
}

export function JournalEntriesPage() {
  const t = useTranslations('journalEntries');
  const tCommon = useTranslations('common');
  const canRecord = usePermission(PERMISSIONS.ACCOUNTING_RECORD_JOURNAL_ENTRIES);
  const canManage = usePermission(PERMISSIONS.ACCOUNTING_MANAGE_JOURNAL_ENTRIES);

  const [status, setStatus] = useState<JournalEntryStatus | typeof ALL>(ALL);
  const [pageSize, setPageSize] = useState('10');
  const [page, setPage] = useState(0);
  const [deleting, setDeleting] = useState<JournalEntryListItem | null>(null);

  const query = { status: status === ALL ? undefined : status, page: page + 1, pageSize: Number(pageSize) };
  const entriesQuery = useJournalEntriesQuery(query);
  const postMutation = usePostJournalEntryMutation();
  const deleteMutation = useDeleteJournalEntryMutation();

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(0);
    };
  }

  const items = entriesQuery.data?.items ?? [];
  const total = entriesQuery.data?.total ?? 0;
  const size = Number(pageSize);
  const pageCount = Math.max(1, Math.ceil(total / size));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={status} onValueChange={(value) => resetPage(setStatus)(value as JournalEntryStatus | typeof ALL)}>
          <SelectTrigger className="w-40">
            <SelectValue>{status === ALL ? t('allStatuses') : t(`statuses.${status}`)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t('allStatuses')}</SelectItem>
            {Object.values(JOURNAL_ENTRY_STATUSES).map((value) => (
              <SelectItem key={value} value={value}>
                {t(`statuses.${value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {canRecord && (
          <Button asChild>
            <Link href="/journal-entries/new">
              <Plus className="size-4" />
              {t('newEntry')}
            </Link>
          </Button>
        )}
      </div>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>{t('entryNumber')}</TableHeaderCell>
            <TableHeaderCell>{t('date')}</TableHeaderCell>
            <TableHeaderCell>{t('memo')}</TableHeaderCell>
            <TableHeaderCell>{t('total')}</TableHeaderCell>
            <TableHeaderCell>{t('status')}</TableHeaderCell>
            <TableHeaderCell className="w-16" />
          </tr>
        </TableHead>
        <TableBody>
          {entriesQuery.isPending ? (
            Array.from({ length: 4 }, (_, index) => (
              <TableRow key={index}>
                <TableCell colSpan={6}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="p-0">
                <EmptyState icon={NotebookPen} title={tCommon('noResults')} />
              </TableCell>
            </TableRow>
          ) : (
            items.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <Link
                    href={entry.status === 'DRAFT' ? `/journal-entries/${entry.id}/edit` : `/journal-entries/${entry.id}`}
                    className="font-medium text-brand hover:underline"
                  >
                    {entry.entryNumber ?? t('draft')}
                  </Link>
                </TableCell>
                <TableCell>{entry.entryDate}</TableCell>
                <TableCell>{entry.memo ?? ''}</TableCell>
                <TableCell>{formatCurrency(entry.totalDebit)}</TableCell>
                <TableCell>
                  <Badge variant={entry.status === 'POSTED' ? 'success' : 'neutral'}>{t(`statuses.${entry.status}`)}</Badge>
                </TableCell>
                <TableCell>
                  {entry.status === 'DRAFT' && (canRecord || canManage) && (
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
                          {canRecord && (
                            <DropdownMenu.Item
                              onSelect={() => postMutation.mutate(entry.id)}
                              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-zinc-50"
                            >
                              {t('post')}
                            </DropdownMenu.Item>
                          )}
                          {canManage && (
                            <DropdownMenu.Item
                              onSelect={() => setDeleting(entry)}
                              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 outline-none data-[highlighted]:bg-red-50"
                            >
                              <Trash2 className="size-4" />
                              {tCommon('delete')}
                            </DropdownMenu.Item>
                          )}
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={Math.min(page, pageCount - 1)}
        pageCount={pageCount}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={resetPage(setPageSize)}
        pageSizeLabel={t('noOfResults')}
        summary={total > 0 ? t('showing', { from: page * size + 1, to: Math.min(total, (page + 1) * size), total }) : undefined}
      />

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
