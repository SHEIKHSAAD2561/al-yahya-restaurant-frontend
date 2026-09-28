'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DISCOUNT_TYPES, type DiscountType } from '../types/sale';

interface DiscountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: DiscountType | null;
  value: number | null;
  onSave: (type: DiscountType | null, value: number | null) => void;
}

export function DiscountDialog({ open, onOpenChange, type, value, onSave }: DiscountDialogProps) {
  const t = useTranslations('sellScreen');
  const tCommon = useTranslations('common');
  const [draftType, setDraftType] = useState<DiscountType>(type ?? DISCOUNT_TYPES.PERCENT);
  const [draftValue, setDraftValue] = useState(value !== null ? String(value) : '');

  function handleOpenChange(next: boolean) {
    if (next) {
      setDraftType(type ?? DISCOUNT_TYPES.PERCENT);
      setDraftValue(value !== null ? String(value) : '');
    }
    onOpenChange(next);
  }

  function handleSave() {
    const numeric = Number(draftValue);
    if (draftValue.trim() === '' || !Number.isFinite(numeric) || numeric <= 0) {
      onSave(null, null);
    } else {
      onSave(draftType, numeric);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('saleDiscount')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {Object.values(DISCOUNT_TYPES).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDraftType(option)}
                className={cn(
                  'rounded-lg border py-2 text-sm font-medium transition-colors',
                  draftType === option ? 'border-brand bg-brand-muted text-brand' : 'border-zinc-200 text-zinc-600',
                )}
              >
                {t(`discountTypes.${option}`)}
              </button>
            ))}
          </div>
          <Input
            type="number"
            step="0.01"
            min="0"
            autoFocus
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
            placeholder={draftType === DISCOUNT_TYPES.PERCENT ? '%' : t('currency')}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {tCommon('cancel')}
          </Button>
          <Button type="button" onClick={handleSave}>
            {tCommon('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
