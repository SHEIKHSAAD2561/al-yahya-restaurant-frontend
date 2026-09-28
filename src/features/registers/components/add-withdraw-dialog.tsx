'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAddCashMovementMutation } from '../hooks/use-add-cash-movement-mutation';
import { CASH_MOVEMENT_TYPES, type CashMovementType } from '../types/register';

interface AddWithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registerId: string;
}

export function AddWithdrawDialog({ open, onOpenChange, registerId }: AddWithdrawDialogProps) {
  const t = useTranslations('registers');
  const tCommon = useTranslations('common');
  const mutation = useAddCashMovementMutation(registerId);

  const [type, setType] = useState<CashMovementType>(CASH_MOVEMENT_TYPES.IN);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  function handleOpenChange(next: boolean) {
    if (!next) {
      setType(CASH_MOVEMENT_TYPES.IN);
      setAmount('');
      setReason('');
    }
    onOpenChange(next);
  }

  function handleSubmit() {
    mutation.mutate(
      { type, amount: Number(amount), reason: reason.trim() || undefined },
      { onSuccess: () => handleOpenChange(false) },
    );
  }

  const amountValue = Number(amount);
  const canSubmit = amount.trim() !== '' && Number.isFinite(amountValue) && amountValue > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('addWithdraw')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {Object.values(CASH_MOVEMENT_TYPES).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={cn(
                  'rounded-lg border py-2 text-sm font-medium transition-colors',
                  type === value ? 'border-brand bg-brand-muted text-brand' : 'border-zinc-200 text-zinc-600',
                )}
              >
                {t(`cashMovementTypes.${value}`)}
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cashAmount">{t('amount')}</Label>
            <Input
              id="cashAmount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cashReason">{t('reason')}</Label>
            <Input id="cashReason" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={255} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
            {tCommon('cancel')}
          </Button>
          <Button type="button" disabled={!canSubmit || mutation.isPending} onClick={handleSubmit}>
            {tCommon('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
