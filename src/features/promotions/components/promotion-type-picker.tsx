'use client';

import { Percent, Gift } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PROMOTION_TYPES, type PromotionType } from '../types/promotion';

const ICONS = { DISCOUNT_OFF_PRODUCTS: Percent, BUY_X_GET_Y: Gift } as const;

export function PromotionTypePicker({ onChoose }: { onChoose: (type: PromotionType) => void }) {
  const t = useTranslations('promotions');

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      {Object.values(PROMOTION_TYPES).map((type) => {
        const Icon = ICONS[type];
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChoose(type)}
            className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-8 text-center transition-colors hover:border-brand hover:bg-brand-muted"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-brand-muted text-brand">
              <Icon className="size-6" />
            </span>
            <span className="text-base font-semibold text-zinc-900">{t(`types.${type}`)}</span>
            <span className="text-sm text-zinc-500">{t(`typeDescriptions.${type}`)}</span>
          </button>
        );
      })}
    </div>
  );
}
