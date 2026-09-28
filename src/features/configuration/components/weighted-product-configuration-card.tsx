'use client';

import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { NumberStepper } from '@/components/ui/number-stepper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { configurationApi } from '../api/configuration.api';
import { useUpdateConfigurationMutation } from '../hooks/use-update-configuration-mutation';
import {
  BARCODE_PREFIX_MAX,
  BARCODE_PREFIX_MIN,
  weightedProductConfigurationSchema,
  type WeightedProductConfigurationInput,
} from '../schemas/configuration.schema';
import { BARCODE_VALUE_TYPES, WEIGHT_UNITS, type Configuration } from '../types/configuration';
import { ConfigurationCard } from './configuration-card';

/** Digits after the SKU in an EAN-13 weighted barcode (before any check digit). */
const VALUE_DIGITS = 5;

export function WeightedProductConfigurationCard({ configuration }: { configuration: Configuration }) {
  const t = useTranslations('settings.configuration');
  const mutation = useUpdateConfigurationMutation(configurationApi.updateWeightedProduct);
  const decimalDigits = configuration.weightDecimalDigits;

  const {
    control,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<WeightedProductConfigurationInput>({
    resolver: zodResolver(weightedProductConfigurationSchema),
    defaultValues: {
      weightUnit: configuration.weightUnit,
      barcodeValueType: configuration.barcodeValueType,
      barcodePrefix: configuration.barcodePrefix,
      barcodeHasCheckDigit: configuration.barcodeHasCheckDigit,
    },
  });

  const [barcodePrefix, barcodeHasCheckDigit] = useWatch({
    control,
    name: ['barcodePrefix', 'barcodeHasCheckDigit'],
  });
  // e.g. "21 (SKU) NNDDD" — N = whole digits, D = decimal digits, C = check digit.
  const formula = [
    Number.isNaN(barcodePrefix) ? '' : barcodePrefix,
    '(SKU)',
    'N'.repeat(VALUE_DIGITS - decimalDigits) + 'D'.repeat(decimalDigits),
    barcodeHasCheckDigit ? 'C' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <ConfigurationCard
      title={t('weightedProduct.title')}
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      canSave={isDirty && !mutation.isPending}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{t('weightedProduct.weightUnit')}</Label>
          <Controller
            control={control}
            name="weightUnit"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue>{t(`weightUnits.${field.value}`)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.values(WEIGHT_UNITS).map((value) => (
                    <SelectItem key={value} value={value}>
                      {t(`weightUnits.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>{t('weightedProduct.lastDigitsRepresent')}</Label>
          <Controller
            control={control}
            name="barcodeValueType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue>{t(`barcodeValueTypes.${field.value}`)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.values(BARCODE_VALUE_TYPES).map((value) => (
                    <SelectItem key={value} value={value}>
                      {t(`barcodeValueTypes.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="barcodePrefix">{t('weightedProduct.starterName')}</Label>
          <Controller
            control={control}
            name="barcodePrefix"
            render={({ field }) => (
              <NumberStepper
                id="barcodePrefix"
                value={field.value}
                onChange={field.onChange}
                min={BARCODE_PREFIX_MIN}
                max={BARCODE_PREFIX_MAX}
              />
            )}
          />
          {errors.barcodePrefix && (
            <p className="text-sm text-red-600">
              {t('weightedProduct.starterNameRange', {
                min: BARCODE_PREFIX_MIN,
                max: BARCODE_PREFIX_MAX,
              })}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="weightDecimalDigits">{t('weightedProduct.weightDecimalDigits')}</Label>
          <NumberStepper id="weightDecimalDigits" value={decimalDigits} disabled />
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <Controller
          control={control}
          name="barcodeHasCheckDigit"
          render={({ field }) => (
            <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-zinc-700">
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
              {t('weightedProduct.hasCheckDigit')}
            </label>
          )}
        />
        <div className="text-sm text-zinc-700">
          <p>{t('weightedProduct.skuFormula')}</p>
          <p dir="ltr" className="font-medium text-zinc-900 rtl:text-end">
            {formula}
          </p>
        </div>
      </div>
    </ConfigurationCard>
  );
}
