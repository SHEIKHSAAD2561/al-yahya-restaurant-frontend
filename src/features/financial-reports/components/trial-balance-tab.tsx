'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { useTrialBalanceQuery } from '../hooks/use-financial-reports';

function fmt(value: number): string {
  return value === 0 ? '' : value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function TrialBalanceTab() {
  const t = useTranslations('financialReports');
  const [asOf, setAsOf] = useState('');
  const query = useTrialBalanceQuery(asOf || undefined);

  return (
    <div className="space-y-4">
      <div className="max-w-xs space-y-1.5">
        <Label htmlFor="trialBalanceAsOf">{t('asOf')}</Label>
        <Input id="trialBalanceAsOf" type="date" value={asOf} onChange={(event) => setAsOf(event.target.value)} />
      </div>

      {query.isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>{t('code')}</TableHeaderCell>
              <TableHeaderCell>{t('account')}</TableHeaderCell>
              <TableHeaderCell>{t('debit')}</TableHeaderCell>
              <TableHeaderCell>{t('credit')}</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {(query.data?.rows ?? []).map((row) => (
              <TableRow key={row.accountId}>
                <TableCell>{row.code}</TableCell>
                <TableCell className="font-medium text-zinc-900">{row.name}</TableCell>
                <TableCell>{fmt(row.debitBalance)}</TableCell>
                <TableCell>{fmt(row.creditBalance)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold text-zinc-900 hover:bg-transparent">
              <TableCell colSpan={2}>{t('total')}</TableCell>
              <TableCell>{fmt(query.data?.totalDebit ?? 0)}</TableCell>
              <TableCell>{fmt(query.data?.totalCredit ?? 0)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </div>
  );
}
