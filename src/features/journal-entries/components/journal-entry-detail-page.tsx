'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QueryErrorState } from '@/components/ui/query-error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { Link, useRouter } from '@/core/i18n/navigation';
import { usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { useJournalEntryQuery } from '../hooks/use-journal-entry-query';
import { useReverseJournalEntryMutation } from '../hooks/use-journal-entry-mutations';

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function JournalEntryDetailPage({ entryId }: { entryId: string }) {
  const t = useTranslations('journalEntries');
  const router = useRouter();
  const canManage = usePermission(PERMISSIONS.ACCOUNTING_MANAGE_JOURNAL_ENTRIES);
  const entryQuery = useJournalEntryQuery(entryId);
  const reverseMutation = useReverseJournalEntryMutation();

  if (entryQuery.isPending) return <Skeleton className="h-96 w-full" />;
  if (entryQuery.isError || !entryQuery.data) {
    return <QueryErrorState onRetry={() => void entryQuery.refetch()} />;
  }

  const entry = entryQuery.data;
  const totalDebit = entry.lines.reduce((sum, line) => sum + Number(line.debit), 0);
  const totalCredit = entry.lines.reduce((sum, line) => sum + Number(line.credit), 0);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/journal-entries" aria-label={t('back')} className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100">
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </Link>
        <h1 className="flex-1 text-lg font-semibold text-zinc-900">{entry.entryNumber}</h1>
        <Badge variant={entry.status === 'POSTED' ? 'success' : 'neutral'}>{t(`statuses.${entry.status}`)}</Badge>
      </div>

      {entry.reversalOfEntryId && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{t('isReversalNote')}</p>
      )}

      <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6 sm:grid-cols-2">
        <div>
          <div className="text-xs font-medium text-zinc-500">{t('date')}</div>
          <div className="text-sm text-zinc-900">{entry.entryDate}</div>
        </div>
        {entry.memo && (
          <div className="sm:col-span-2">
            <div className="text-xs font-medium text-zinc-500">{t('memo')}</div>
            <div className="text-sm text-zinc-900">{entry.memo}</div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">{t('lines')}</h2>
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>{t('account')}</TableHeaderCell>
              <TableHeaderCell>{t('description')}</TableHeaderCell>
              <TableHeaderCell>{t('debit')}</TableHeaderCell>
              <TableHeaderCell>{t('credit')}</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {entry.lines.map((line) => (
              <TableRow key={line.id}>
                <TableCell className="font-medium text-zinc-900">
                  {line.account?.code} — {line.account?.name}
                </TableCell>
                <TableCell>{line.description ?? ''}</TableCell>
                <TableCell>{Number(line.debit) > 0 ? formatCurrency(line.debit) : ''}</TableCell>
                <TableCell>{Number(line.credit) > 0 ? formatCurrency(line.credit) : ''}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold text-zinc-900 hover:bg-transparent">
              <TableCell colSpan={2}>{t('total')}</TableCell>
              <TableCell>{formatCurrency(totalDebit)}</TableCell>
              <TableCell>{formatCurrency(totalCredit)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {canManage && entry.status === 'POSTED' && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={reverseMutation.isPending}
            onClick={() =>
              reverseMutation.mutate(entry.id, {
                onSuccess: (reversal) => router.push(`/journal-entries/${reversal.id}`),
              })
            }
          >
            {t('reverse')}
          </Button>
        </div>
      )}
    </div>
  );
}
