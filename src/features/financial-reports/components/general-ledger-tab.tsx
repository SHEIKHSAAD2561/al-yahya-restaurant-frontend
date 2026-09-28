'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { BookText } from 'lucide-react';
import { useAccountsQuery } from '@/features/chart-of-accounts/hooks/use-accounts-query';
import { useGeneralLedgerQuery } from '../hooks/use-financial-reports';

function fmt(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function GeneralLedgerTab() {
  const t = useTranslations('financialReports');
  const tCommon = useTranslations('common');
  const accountsQuery = useAccountsQuery();
  const [accountId, setAccountId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const query = useGeneralLedgerQuery(accountId, dateFrom || undefined, dateTo || undefined);

  const accounts = accountsQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 space-y-1.5">
          <Label>{t('account')}</Label>
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger>
              <SelectValue>
                {(() => {
                  const account = accounts.find((a) => a.id === accountId);
                  return account ? `${account.code} — ${account.name}` : t('selectAccount');
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.code} — {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ledgerFrom">{t('dateFrom')}</Label>
          <Input id="ledgerFrom" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ledgerTo">{t('dateTo')}</Label>
          <Input id="ledgerTo" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
        </div>
      </div>

      {!accountId ? (
        <EmptyState icon={BookText} title={t('selectAccountPrompt')} />
      ) : query.isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>{t('date')}</TableHeaderCell>
              <TableHeaderCell>{t('entryNumber')}</TableHeaderCell>
              <TableHeaderCell>{t('description')}</TableHeaderCell>
              <TableHeaderCell>{t('debit')}</TableHeaderCell>
              <TableHeaderCell>{t('credit')}</TableHeaderCell>
              <TableHeaderCell>{t('runningBalance')}</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {(query.data?.lines.length ?? 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="p-0">
                  <EmptyState icon={BookText} title={tCommon('noResults')} />
                </TableCell>
              </TableRow>
            ) : (
              query.data!.lines.map((line, index) => (
                <TableRow key={`${line.journalEntryId}-${index}`}>
                  <TableCell>{line.entryDate}</TableCell>
                  <TableCell className="font-medium text-zinc-900">{line.entryNumber}</TableCell>
                  <TableCell>{line.description ?? line.memo ?? ''}</TableCell>
                  <TableCell>{line.debit > 0 ? fmt(line.debit) : ''}</TableCell>
                  <TableCell>{line.credit > 0 ? fmt(line.credit) : ''}</TableCell>
                  <TableCell>{fmt(line.runningBalance)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
