'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { NumberStepper } from '@/components/ui/number-stepper';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { SAR_DENOMINATIONS, type Denomination } from '../types/register';

interface DenominationFormProps {
  registerName: string;
  amountLabel: string;
  actionLabel: string;
  isPending: boolean;
  onSubmit: (input: { amount: number; denominations: Denomination[] }) => void;
}

/**
 * Shared by Open Register and Close Register — a denomination breakdown
 * (Rewaa's own SAR notes/coins) whose counts drive the total; the amount
 * field is computed from them (not independently editable), so the count
 * you hand in always matches the number you're recording.
 */
export function DenominationForm({ registerName, amountLabel, actionLabel, isPending, onSubmit }: DenominationFormProps) {
  const t = useTranslations('registers');
  const [counts, setCounts] = useState<Record<number, number>>({});

  const amount = SAR_DENOMINATIONS.reduce((sum, value) => sum + value * (counts[value] ?? 0), 0);

  function setCount(value: number, count: number) {
    setCounts((current) => ({ ...current, [value]: count }));
  }

  function handleSubmit() {
    onSubmit({
      amount,
      denominations: SAR_DENOMINATIONS.filter((value) => (counts[value] ?? 0) > 0).map((value) => ({
        value,
        count: counts[value],
      })),
    });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-[20rem_1fr]">
      <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-900">{registerName}</h2>
        <div className="space-y-1.5">
          <Label>{amountLabel}</Label>
          <div className="flex items-center gap-2">
            <NumberStepper value={amount} disabled />
            <span className="text-sm text-zinc-500">{t('currency')}</span>
          </div>
        </div>
        <Button className="w-full" disabled={isPending} onClick={handleSubmit}>
          {actionLabel}
        </Button>
      </div>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>{t('denomination')}</TableHeaderCell>
            <TableHeaderCell>{t('count')}</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {SAR_DENOMINATIONS.map((value) => (
            <TableRow key={value}>
              <TableCell className="font-medium text-zinc-900">
                {value} <span className="text-zinc-400">{t('currency')}</span>
              </TableCell>
              <TableCell>
                <NumberStepper
                  value={counts[value] ?? 0}
                  onChange={(count) => setCount(value, count)}
                  min={0}
                  max={9999}
                  className="max-w-40"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
