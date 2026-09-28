'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRecordDepreciationMutation } from '../hooks/use-fixed-asset-mutations';
import type { FixedAsset } from '../types/fixed-asset';

function straightLineMonthly(asset: FixedAsset): number {
  return (Number(asset.purchaseCost) - Number(asset.salvageValue)) / asset.usefulLifeMonths;
}

interface RecordDepreciationDialogProps {
  asset: FixedAsset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecordDepreciationDialog({ asset, open, onOpenChange }: RecordDepreciationDialogProps) {
  const t = useTranslations('fixedAssets');
  const tCommon = useTranslations('common');
  const recordMutation = useRecordDepreciationMutation(asset?.id ?? '');

  const [periodDate, setPeriodDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState('');

  function handleOpenChange(next: boolean) {
    if (!next) {
      setPeriodDate(new Date().toISOString().slice(0, 10));
      setAmount('');
    }
    onOpenChange(next);
  }

  function handleSubmit() {
    if (!asset) return;
    recordMutation.mutate(
      { periodDate, amount: amount.trim() ? Number(amount) : undefined },
      { onSuccess: () => handleOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('recordDepreciation')}</DialogTitle>
        </DialogHeader>
        {asset && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600">
              {t('suggestedAmount', { amount: straightLineMonthly(asset).toFixed(2) })}
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="periodDate">{t('periodDate')}</Label>
              <Input id="periodDate" type="date" value={periodDate} onChange={(event) => setPeriodDate(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="depreciationAmount">{t('amountOverride')}</Label>
              <Input
                id="depreciationAmount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder={straightLineMonthly(asset).toFixed(2)}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
            {tCommon('cancel')}
          </Button>
          <Button type="button" disabled={recordMutation.isPending} onClick={handleSubmit}>
            {tCommon('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
