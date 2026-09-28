'use client';

import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { PRODUCT_TYPES, type ProductType } from '../types/product';
import { FormSection } from './form-section';

interface ProductTypePickerProps {
  value: ProductType;
  onChange?: (type: ProductType) => void;
  /** Type is fixed once a product is saved. */
  disabled?: boolean;
}

export function ProductTypePicker({ value, onChange, disabled }: ProductTypePickerProps) {
  const t = useTranslations('products');

  return (
    <FormSection>
      <h2 className="text-sm font-semibold text-zinc-900">
        <span className="text-red-600">*</span> {t('form.productType')}
      </h2>
      <p className="mb-4 text-xs text-zinc-500">{t('form.productTypeLocked')}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {Object.values(PRODUCT_TYPES).map((type) => (
          <button
            key={type}
            type="button"
            disabled={disabled && type !== value}
            onClick={() => onChange?.(type)}
            aria-pressed={type === value}
            className={cn(
              'flex h-12 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-colors',
              type === value
                ? 'border-brand bg-brand-muted text-zinc-900'
                : 'border-zinc-200 text-zinc-700 hover:border-zinc-300',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {t(`types.${type}`)}
            <span title={t(`typeHints.${type}`)} className="text-zinc-400">
              <Info className="size-3.5" />
            </span>
          </button>
        ))}
      </div>
    </FormSection>
  );
}
