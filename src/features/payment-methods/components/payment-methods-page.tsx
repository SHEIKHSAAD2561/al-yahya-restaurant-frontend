'use client';

import { useState } from 'react';
import { CreditCard, Info, Pencil, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { useBankAccountsQuery } from '../hooks/use-bank-accounts-query';
import { usePaymentMethodsQuery } from '../hooks/use-payment-methods-query';
import { AddBankAccountDialog } from './add-bank-account-dialog';
import { PaymentMethodRowForm } from './payment-method-row-form';
import { PAYMENT_METHOD_TYPES, bankAccountLabel } from '../types/payment-method';

const ALL = 'ALL';
const COLUMN_COUNT = 5;

/** `'new'` = the add row is open, an id = that row is being edited. */
type Editing = 'new' | string | null;

export function PaymentMethodsPage() {
  const t = useTranslations('settings.paymentMethods');
  const tCommon = useTranslations('common');
  const paymentMethodsQuery = usePaymentMethodsQuery();
  const bankAccountsQuery = useBankAccountsQuery();

  const [editing, setEditing] = useState<Editing>(null);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [nameFilter, setNameFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState(ALL);
  const [accountFilter, setAccountFilter] = useState(ALL);
  const [descriptionFilter, setDescriptionFilter] = useState('');
  const [pageSize, setPageSize] = useState('10');
  const [page, setPage] = useState(0);

  const bankAccounts = bankAccountsQuery.data ?? [];
  const accountLabel = (id: string | null) => {
    const account = id ? bankAccounts.find((candidate) => candidate.id === id) : undefined;
    return account ? bankAccountLabel(account) : '';
  };

  // Small, fully-loaded list — filtered and paged client-side.
  const matches = (value: string | null, query: string) =>
    (value ?? '').toLowerCase().includes(query.trim().toLowerCase());
  const filtered = (paymentMethodsQuery.data ?? []).filter(
    (method) =>
      matches(method.name, nameFilter) &&
      matches(method.description, descriptionFilter) &&
      (typeFilter === ALL || method.type === typeFilter) &&
      (accountFilter === ALL || method.bankAccountId === accountFilter),
  );

  const size = Number(pageSize);
  const pageCount = Math.max(1, Math.ceil(filtered.length / size));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(currentPage * size, currentPage * size + size);

  function filterChanged<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(0);
    };
  }

  const closeEditor = () => setEditing(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-semibold text-zinc-900">{t('title')}</h1>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setEditing('new')} disabled={editing === 'new'}>
            <Plus className="size-4" />
            {t('addPaymentMethod')}
          </Button>
          <Button onClick={() => setBankDialogOpen(true)}>
            <Plus className="size-4" />
            {t('addNewBank')}
          </Button>
        </div>
      </div>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell className="w-1/4">{t('name')}</TableHeaderCell>
            <TableHeaderCell className="w-1/5">{t('type')}</TableHeaderCell>
            <TableHeaderCell className="w-1/4">
              <span className="inline-flex items-center gap-1">
                {t('linkedAccount')}
                <span title={t('linkedAccountHint')} aria-label={t('linkedAccountHint')}>
                  <Info className="size-3.5" />
                </span>
              </span>
            </TableHeaderCell>
            <TableHeaderCell>{t('description')}</TableHeaderCell>
            <TableHeaderCell className="w-24 text-end">{t('actions')}</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {/* Same slot as Rewaa: the add row replaces the filter row while open. */}
          {editing === 'new' ? (
            <PaymentMethodRowForm key="new" bankAccounts={bankAccounts} onDone={closeEditor} />
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell>
                <Input
                  placeholder={t('namePlaceholder')}
                  value={nameFilter}
                  onChange={(event) => filterChanged(setNameFilter)(event.target.value)}
                />
              </TableCell>
              <TableCell>
                <Select value={typeFilter} onValueChange={filterChanged(setTypeFilter)}>
                  <SelectTrigger>
                    <SelectValue>
                      {typeFilter === ALL ? t('all') : t(`types.${typeFilter}`)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{t('all')}</SelectItem>
                    {Object.values(PAYMENT_METHOD_TYPES).map((value) => (
                      <SelectItem key={value} value={value}>
                        {t(`types.${value}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Select value={accountFilter} onValueChange={filterChanged(setAccountFilter)}>
                  <SelectTrigger>
                    <SelectValue>
                      {accountFilter === ALL ? t('all') : accountLabel(accountFilter)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{t('all')}</SelectItem>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {bankAccountLabel(account)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  placeholder={t('description')}
                  value={descriptionFilter}
                  onChange={(event) => filterChanged(setDescriptionFilter)(event.target.value)}
                />
              </TableCell>
              <TableCell />
            </TableRow>
          )}

          {paymentMethodsQuery.isPending ? (
            Array.from({ length: 2 }, (_, index) => (
              <TableRow key={index}>
                <TableCell colSpan={COLUMN_COUNT}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : pageRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} className="p-0">
                <EmptyState icon={CreditCard} title={tCommon('noResults')} />
              </TableCell>
            </TableRow>
          ) : (
            pageRows.map((method) =>
              editing === method.id ? (
                <PaymentMethodRowForm
                  key={`${method.id}|${method.updatedAt}`}
                  paymentMethod={method}
                  bankAccounts={bankAccounts}
                  onDone={closeEditor}
                />
              ) : (
                <TableRow key={method.id}>
                  <TableCell className="font-medium text-zinc-900">{method.name}</TableCell>
                  <TableCell>{t(`types.${method.type}`)}</TableCell>
                  <TableCell>{accountLabel(method.bankAccountId)}</TableCell>
                  <TableCell>{method.description}</TableCell>
                  <TableCell className="text-end">
                    <button
                      type="button"
                      onClick={() => setEditing(method.id)}
                      aria-label={tCommon('edit')}
                      className="inline-flex rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                    >
                      <Pencil className="size-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ),
            )
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={currentPage}
        pageCount={pageCount}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={filterChanged(setPageSize)}
        pageSizeLabel={t('noOfResults')}
      />

      <AddBankAccountDialog open={bankDialogOpen} onOpenChange={setBankDialogOpen} />
    </div>
  );
}
