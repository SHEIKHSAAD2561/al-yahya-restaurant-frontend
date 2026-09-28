'use client';

import { useState } from 'react';
import { MoreHorizontal, Plus, Receipt, Trash2 } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { useExpensesQuery } from '../hooks/use-expenses-query';
import { useDeleteExpenseMutation } from '../hooks/use-delete-expense-mutation';
import { ExpenseDialog } from './expense-dialog';
import { EXPENSE_CATEGORIES, type ExpenseCategory, type ExpenseListItem } from '../types/expense';

const ALL = 'ALL';

export function ExpensesPage() {
  const t = useTranslations('expenses');
  const tCommon = useTranslations('common');
  const canCreate = usePermission(PERMISSIONS.EXPENSES_CREATE);
  const canEdit = usePermission(PERMISSIONS.EXPENSES_EDIT);
  const canDelete = usePermission(PERMISSIONS.EXPENSES_DELETE);

  const [category, setCategory] = useState<ExpenseCategory | typeof ALL>(ALL);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pageSize, setPageSize] = useState('10');
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<ExpenseListItem | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<ExpenseListItem | null>(null);

  const query = {
    category: category === ALL ? undefined : category,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page: page + 1,
    pageSize: Number(pageSize),
  };
  const expensesQuery = useExpensesQuery(query);
  const deleteMutation = useDeleteExpenseMutation();

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(0);
    };
  }

  const items = expensesQuery.data?.items ?? [];
  const total = expensesQuery.data?.total ?? 0;
  const size = Number(pageSize);
  const pageCount = Math.max(1, Math.ceil(total / size));
  const columnCount = 6 + (canEdit || canDelete ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Input type="date" value={dateFrom} onChange={(event) => resetPage(setDateFrom)(event.target.value)} />
          <Input type="date" value={dateTo} onChange={(event) => resetPage(setDateTo)(event.target.value)} />
          <Select value={category} onValueChange={(value) => resetPage(setCategory)(value as ExpenseCategory | typeof ALL)}>
            <SelectTrigger className="w-44">
              <SelectValue>{category === ALL ? t('allCategories') : t(`categories.${category}`)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('allCategories')}</SelectItem>
              {Object.values(EXPENSE_CATEGORIES).map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`categories.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {canCreate && (
          <Button onClick={() => setEditing(null)}>
            <Plus className="size-4" />
            {t('addExpense')}
          </Button>
        )}
      </div>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>{t('date')}</TableHeaderCell>
            <TableHeaderCell>{t('category')}</TableHeaderCell>
            <TableHeaderCell>{t('description')}</TableHeaderCell>
            <TableHeaderCell>{t('location')}</TableHeaderCell>
            <TableHeaderCell>{t('amount')}</TableHeaderCell>
            <TableHeaderCell>{t('recordedBy')}</TableHeaderCell>
            {(canEdit || canDelete) && <TableHeaderCell className="w-16" />}
          </tr>
        </TableHead>
        <TableBody>
          {expensesQuery.isPending ? (
            Array.from({ length: 4 }, (_, index) => (
              <TableRow key={index}>
                <TableCell colSpan={columnCount}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnCount} className="p-0">
                <EmptyState icon={Receipt} title={tCommon('noResults')} />
              </TableCell>
            </TableRow>
          ) : (
            items.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{expense.expenseDate}</TableCell>
                <TableCell>{t(`categories.${expense.category}`)}</TableCell>
                <TableCell className="font-medium text-zinc-900">{expense.description}</TableCell>
                <TableCell>{expense.locationName ?? t('allLocationsExpense')}</TableCell>
                <TableCell>{expense.amount.toFixed(2)}</TableCell>
                <TableCell>{expense.createdByName}</TableCell>
                {(canEdit || canDelete) && (
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
                          {canEdit && (
                            <DropdownMenu.Item
                              onSelect={() => setEditing(expense)}
                              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-zinc-50"
                            >
                              {tCommon('edit')}
                            </DropdownMenu.Item>
                          )}
                          {canDelete && (
                            <DropdownMenu.Item
                              onSelect={() => setDeleting(expense)}
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

      <TablePagination
        page={Math.min(page, pageCount - 1)}
        pageCount={pageCount}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={resetPage(setPageSize)}
        pageSizeLabel={t('noOfResults')}
        summary={total > 0 ? t('showing', { from: page * size + 1, to: Math.min(total, (page + 1) * size), total }) : undefined}
      />

      {editing !== undefined && (
        <ExpenseDialog
          key={editing?.id ?? 'new'}
          open={editing !== undefined}
          expense={editing}
          onOpenChange={(open) => !open && setEditing(undefined)}
        />
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
