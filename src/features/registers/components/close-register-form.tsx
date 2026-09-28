'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { NumberStepper } from '@/components/ui/number-stepper';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { PAYMENT_METHOD_TYPES } from '@/features/payment-methods/types/payment-method';
import { SAR_DENOMINATIONS, type RegisterPaymentMethodRef } from '../types/register';
import type { PaymentMethodCountInput } from '../api/registers.api';

interface CloseRegisterFormProps {
  registerName: string;
  paymentMethods: RegisterPaymentMethodRef[];
  isPending: boolean;
  onSubmit: (input: { counts: PaymentMethodCountInput[] }) => void;
}

/**
 * Close Register reconciles every payment method assigned to the register
 * (not just cash) — the backend rejects a close that omits one. The cash-type
 * method gets a denomination breakdown (its counted amount is the sum of
 * those); every other method is a single counted-amount input.
 */
export function CloseRegisterForm({ registerName, paymentMethods, isPending, onSubmit }: CloseRegisterFormProps) {
  const t = useTranslations('registers');
  const [denominationCounts, setDenominationCounts] = useState<Record<number, number>>({});
  const [otherCounts, setOtherCounts] = useState<Record<string, string>>({});

  const cashMethod = paymentMethods.find((method) => method.type === PAYMENT_METHOD_TYPES.CASH);
  const otherMethods = paymentMethods.filter((method) => method.id !== cashMethod?.id);

  const cashAmount = SAR_DENOMINATIONS.reduce(
    (sum, value) => sum + value * (denominationCounts[value] ?? 0),
    0,
  );

  function setDenominationCount(value: number, count: number) {
    setDenominationCounts((current) => ({ ...current, [value]: count }));
  }

  function handleSubmit() {
    const counts: PaymentMethodCountInput[] = [];
    if (cashMethod) {
      counts.push({
        paymentMethodId: cashMethod.id,
        countedAmount: cashAmount,
        denominations: SAR_DENOMINATIONS.filter((value) => (denominationCounts[value] ?? 0) > 0).map((value) => ({
          value,
          count: denominationCounts[value],
        })),
      });
    }
    for (const method of otherMethods) {
      counts.push({
        paymentMethodId: method.id,
        countedAmount: Number(otherCounts[method.id] ?? 0),
        denominations: [],
      });
    }
    onSubmit({ counts });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-[20rem_1fr]">
      <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-900">{registerName}</h2>
        {cashMethod && (
          <div className="space-y-1.5">
            <Label>{cashMethod.name}</Label>
            <div className="flex items-center gap-2">
              <NumberStepper value={cashAmount} disabled />
              <span className="text-sm text-zinc-500">{t('currency')}</span>
            </div>
          </div>
        )}
        {otherMethods.map((method) => (
          <div key={method.id} className="space-y-1.5">
            <Label htmlFor={`count-${method.id}`}>{method.name}</Label>
            <div className="flex items-center gap-2">
              <input
                id={`count-${method.id}`}
                type="number"
                step="0.01"
                min="0"
                value={otherCounts[method.id] ?? ''}
                onChange={(event) =>
                  setOtherCounts((current) => ({ ...current, [method.id]: event.target.value }))
                }
                className="h-9 w-full rounded-md border border-zinc-300 px-3 text-sm"
              />
              <span className="text-sm text-zinc-500">{t('currency')}</span>
            </div>
          </div>
        ))}
        <Button className="w-full" disabled={isPending} onClick={handleSubmit}>
          {t('closeRegisterAction', { name: registerName })}
        </Button>
      </div>

      {cashMethod && (
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
                    value={denominationCounts[value] ?? 0}
                    onChange={(count) => setDenominationCount(value, count)}
                    min={0}
                    max={9999}
                    className="max-w-40"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
