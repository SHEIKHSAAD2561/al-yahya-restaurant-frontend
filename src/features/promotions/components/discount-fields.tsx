'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { PROMOTION_DISCOUNT_TYPES, type PromotionDiscountType } from '../types/promotion';

interface DiscountFieldsProps {
  label: string;
  discountType: PromotionDiscountType | undefined;
  onDiscountTypeChange: (type: PromotionDiscountType) => void;
  discountValue: number | undefined;
  onDiscountValueChange: (value: number | undefined) => void;
}

export function DiscountFields({
  label,
  discountType,
  onDiscountTypeChange,
  discountValue,
  onDiscountValueChange,
}: DiscountFieldsProps) {
  const t = useTranslations('promotions');

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <div className="grid grid-cols-2 gap-2">
          {Object.values(PROMOTION_DISCOUNT_TYPES).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onDiscountTypeChange(value)}
              className={cn(
                'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                discountType === value ? 'border-brand bg-brand-muted text-brand' : 'border-zinc-200 text-zinc-600',
              )}
            >
              {value === PROMOTION_DISCOUNT_TYPES.PERCENT ? t('percentOff') : t('amountOff')}
            </button>
          ))}
        </div>
        <Input
          type="number"
          min="0"
          step="0.01"
          max={discountType === PROMOTION_DISCOUNT_TYPES.PERCENT ? 100 : undefined}
          value={discountValue ?? ''}
          onChange={(event) => onDiscountValueChange(event.target.value === '' ? undefined : Number(event.target.value))}
          className="flex-1"
        />
      </div>
    </div>
  );
}
