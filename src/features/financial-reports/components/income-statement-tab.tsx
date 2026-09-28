'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { useIncomeStatementQuery } from '../hooks/use-financial-reports';

function fmt(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function IncomeStatementTab() {
  const t = useTranslations('financialReports');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const query = useIncomeStatementQuery(dateFrom || undefined, dateTo || undefined);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="incomeFrom">{t('dateFrom')}</Label>
          <Input id="incomeFrom" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="incomeTo">{t('dateTo')}</Label>
          <Input id="incomeTo" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
        </div>
      </div>

      {query.isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="mx-auto max-w-xl space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="mb-2 text-sm font-semibold text-zinc-900">{t('revenue')}</h2>
            <Table>
              <TableBody>
                {query.data!.revenue.map((row) => (
                  <TableRow key={row.accountId}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell className="text-end">{fmt(row.balance)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-semibold text-zinc-900 hover:bg-transparent">
                  <TableCell>{t('totalRevenue')}</TableCell>
                  <TableCell className="text-end">{fmt(query.data!.totalRevenue)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="mb-2 text-sm font-semibold text-zinc-900">{t('expenses')}</h2>
            <Table>
              <TableBody>
                {query.data!.expense.map((row) => (
                  <TableRow key={row.accountId}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell className="text-end">{fmt(row.balance)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-semibold text-zinc-900 hover:bg-transparent">
                  <TableCell>{t('totalExpenses')}</TableCell>
                  <TableCell className="text-end">{fmt(query.data!.totalExpense)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-base font-semibold text-zinc-900">
            <span>{t('netIncome')}</span>
            <span className={query.data!.netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'}>
              {fmt(query.data!.netIncome)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
