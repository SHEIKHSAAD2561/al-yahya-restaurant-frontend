'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { Link, useRouter } from '@/core/i18n/navigation';
import { useAccountsQuery } from '@/features/chart-of-accounts/hooks/use-accounts-query';
import { useSaveJournalEntryMutation, usePostJournalEntryMutation } from '../hooks/use-journal-entry-mutations';
import type { JournalEntryLineInput } from '../api/journal-entries.api';
import type { JournalEntry } from '../types/journal-entry';

interface DraftLine extends JournalEntryLineInput {
  key: string;
}

function newLine(): DraftLine {
  return { key: `new-${Math.random().toString(36).slice(2)}`, accountId: '', debit: 0, credit: 0 };
}

interface JournalEntryFormPageProps {
  entry?: JournalEntry;
}

export function JournalEntryFormPage({ entry }: JournalEntryFormPageProps) {
  const t = useTranslations('journalEntries');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const accountsQuery = useAccountsQuery();
  const saveMutation = useSaveJournalEntryMutation(entry?.id);
  const postMutation = usePostJournalEntryMutation();

  const [entryDate, setEntryDate] = useState(entry?.entryDate ?? new Date().toISOString().slice(0, 10));
  const [memo, setMemo] = useState(entry?.memo ?? '');
  const [lines, setLines] = useState<DraftLine[]>(
    entry
      ? entry.lines.map((line) => ({
          key: line.id,
          accountId: line.accountId,
          debit: line.debit,
          credit: line.credit,
          description: line.description ?? undefined,
        }))
      : [newLine(), newLine()],
  );

  const activeAccounts = (accountsQuery.data ?? []).filter((account) => account.isActive);
  const totalDebit = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;
  const linesValid = lines.every((line) => {
    const hasDebit = Number(line.debit) > 0;
    const hasCredit = Number(line.credit) > 0;
    return Boolean(line.accountId) && hasDebit !== hasCredit;
  });
  const canSave = lines.length >= 2 && linesValid;

  function updateLine(key: string, patch: Partial<DraftLine>) {
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  }

  function addLine() {
    setLines((current) => [...current, newLine()]);
  }

  function removeLine(key: string) {
    setLines((current) => current.filter((line) => line.key !== key));
  }

  function buildInput() {
    return {
      entryDate,
      memo: memo.trim() || undefined,
      lines: lines.map((line) => ({
        accountId: line.accountId,
        debit: Number(line.debit) || 0,
        credit: Number(line.credit) || 0,
        description: line.description?.trim() || undefined,
      })),
    };
  }

  function handleSave(post: boolean) {
    saveMutation.mutate(buildInput(), {
      onSuccess: (saved) => {
        if (post) {
          postMutation.mutate(saved.id, { onSuccess: () => router.push('/journal-entries') });
        } else {
          router.push('/journal-entries');
        }
      },
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/journal-entries" aria-label={t('back')} className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100">
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </Link>
        <h1 className="text-lg font-semibold text-zinc-900">{entry ? t('editDraft') : t('newEntry')}</h1>
      </div>

      <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="entryDate">{t('date')}</Label>
          <Input id="entryDate" type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="memo">{t('memo')}</Label>
          <Input id="memo" value={memo} onChange={(event) => setMemo(event.target.value)} maxLength={500} />
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">{t('lines')}</h2>
          <Button type="button" variant="outline" size="sm" onClick={addLine}>
            <Plus className="size-4" />
            {t('addLine')}
          </Button>
        </div>

        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>{t('account')}</TableHeaderCell>
              <TableHeaderCell>{t('description')}</TableHeaderCell>
              <TableHeaderCell>{t('debit')}</TableHeaderCell>
              <TableHeaderCell>{t('credit')}</TableHeaderCell>
              <TableHeaderCell className="w-10" />
            </tr>
          </TableHead>
          <TableBody>
            {lines.map((line) => (
              <TableRow key={line.key}>
                <TableCell className="min-w-44">
                  <Select value={line.accountId} onValueChange={(value) => updateLine(line.key, { accountId: value })}>
                    <SelectTrigger>
                      <SelectValue>
                        {(() => {
                          const account = activeAccounts.find((a) => a.id === line.accountId);
                          return account ? `${account.code} — ${account.name}` : undefined;
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {activeAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.code} — {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    value={line.description ?? ''}
                    onChange={(event) => updateLine(line.key, { description: event.target.value })}
                    className="min-w-32"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.debit || ''}
                    onChange={(event) => updateLine(line.key, { debit: Number(event.target.value), credit: 0 })}
                    className="w-28"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.credit || ''}
                    onChange={(event) => updateLine(line.key, { credit: Number(event.target.value), debit: 0 })}
                    className="w-28"
                  />
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => removeLine(line.key)}
                    aria-label={tCommon('delete')}
                    disabled={lines.length <= 2}
                    className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="ms-auto flex max-w-xs justify-between border-t border-zinc-100 pt-2 text-sm font-semibold text-zinc-900">
          <span>{t('total')}</span>
          <span className={isBalanced ? 'text-emerald-600' : 'text-red-600'}>
            {totalDebit.toFixed(2)} / {totalCredit.toFixed(2)}
          </span>
        </div>
        {!isBalanced && <p className="text-end text-xs text-red-600">{t('notBalanced')}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.push('/journal-entries')}>
          {tCommon('cancel')}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!canSave || saveMutation.isPending || postMutation.isPending}
          onClick={() => handleSave(false)}
        >
          {t('saveDraft')}
        </Button>
        <Button
          type="button"
          disabled={!canSave || !isBalanced || saveMutation.isPending || postMutation.isPending}
          onClick={() => handleSave(true)}
        >
          {t('saveAndPost')}
        </Button>
      </div>
    </div>
  );
}
