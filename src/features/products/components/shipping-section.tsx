'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ProductFormOptions } from '../types/product';
import type { ProductFormValues } from '../schemas/product-form.schema';
import { FormSection } from './form-section';

/** Units come from Settings → Configuration → Shipping. */
export function ShippingSection({ formOptions }: { formOptions: ProductFormOptions }) {
  const t = useTranslations('products');
  const tUnits = useTranslations('settings.configuration');
  const { register } = useFormContext<ProductFormValues>();
  const weightUnit = tUnits(`weightUnits.${formOptions.shippingWeightUnit}`);
  const dimensionUnit = tUnits(`dimensionUnits.${formOptions.shippingDimensionUnit}`);

  const field = (name: 'shippingWeight' | 'shippingLength' | 'shippingWidth' | 'shippingHeight', label: string, unit: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label} ({unit})
      </Label>
      <Input id={name} type="number" step="0.01" min="0" {...register(name)} />
    </div>
  );

  return (
    <FormSection title={t('form.shipping')} hint={t('form.shippingHint')}>
      <div className="space-y-4">
        {field('shippingWeight', t('form.weight'), weightUnit)}
        <div className="grid gap-4 sm:grid-cols-3">
          {field('shippingLength', t('form.length'), dimensionUnit)}
          {field('shippingWidth', t('form.width'), dimensionUnit)}
          {field('shippingHeight', t('form.height'), dimensionUnit)}
        </div>
      </div>
    </FormSection>
  );
}
