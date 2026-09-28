'use client';

import { ChefHat, PackageCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { FormSection } from './form-section';

/** SIMPLE products only. "Produced" (made in-house from a recipe) needs the
 * recipes/units feature, which isn't built yet — shown so the choice is
 * visible, but only "Purchasable" can be selected for now. */
export function ItemSourceSection() {
  const t = useTranslations('products');

  return (
    <FormSection title={t('form.itemSource')} description={t('form.itemSourceHint')}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-lg border border-brand bg-brand-muted p-3">
          <PackageCheck className="size-6 text-zinc-700" />
          <div>
            <p className="text-sm font-semibold text-zinc-900">{t('form.sourcePurchased')}</p>
            <p className="text-xs text-zinc-500">{t('form.sourcePurchasedHint')}</p>
          </div>
        </div>
        <div
          aria-disabled
          className="flex cursor-not-allowed items-center gap-3 rounded-lg border border-zinc-200 p-3 opacity-60"
        >
          <ChefHat className="size-6 text-zinc-700" />
          <div className="flex-1">
            <p className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              {t('form.sourceProduced')}
              <Badge>{t('comingSoon')}</Badge>
            </p>
            <p className="text-xs text-zinc-500">{t('form.sourceProducedHint')}</p>
          </div>
        </div>
      </div>
    </FormSection>
  );
}
