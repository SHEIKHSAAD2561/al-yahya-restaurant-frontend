'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { useBalanceSheetQuery } from '../hooks/use-financial-reports';

function fmt(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function BalanceSheetTab() {
  const t = useTranslations('financialReports');
  const [asOf, setAsOf] = useState('');
  const query = useBalanceSheetQuery(asOf || undefined);

  return (
    <div className="space-y-4">
      <div className="max-w-xs space-y-1.5">
        <Label htmlFor="balanceSheetAsOf">{t('asOf')}</Label>
        <Input id="balanceSheetAsOf" type="date" value={asOf} onChange={(event) => setAsOf(event.target.value)} />
      </div>

      {query.isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="mb-2 text-sm font-semibold text-zinc-900">{t('assets')}</h2>
            <Table>
              <TableBody>
                {query.data!.assets.map((row) => (
                  <TableRow key={row.accountId}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell className="text-end">{fmt(row.balance)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-semibold text-zinc-900 hover:bg-transparent">
                  <TableCell>{t('totalAssets')}</TableCell>
                  <TableCell className="text-end">{fmt(query.data!.totalAssets)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="mb-2 text-sm font-semibold text-zinc-900">{t('liabilities')}</h2>
              <Table>
                <TableBody>
                  {query.data!.liabilities.map((row) => (
                    <TableRow key={row.accountId}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell className="text-end">{fmt(row.balance)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-semibold text-zinc-900 hover:bg-transparent">
                    <TableCell>{t('totalLiabilities')}</TableCell>
                    <TableCell className="text-end">{fmt(query.data!.totalLiabilities)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="mb-2 text-sm font-semibold text-zinc-900">{t('equity')}</h2>
              <Table>
                <TableBody>
                  {query.data!.equity.map((row) => (
                    <TableRow key={row.accountId}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell className="text-end">{fmt(row.balance)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell>{t('netIncome')}</TableCell>
                    <TableCell className="text-end">{fmt(query.data!.netIncome)}</TableCell>
                  </TableRow>
                  <TableRow className="font-semibold text-zinc-900 hover:bg-transparent">
                    <TableCell>{t('totalEquity')}</TableCell>
                    <TableCell className="text-end">{fmt(query.data!.totalEquity)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm font-semibold text-zinc-900">
              <span>{t('totalLiabilitiesAndEquity')}</span>
              <span>{fmt(query.data!.totalLiabilitiesAndEquity)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
