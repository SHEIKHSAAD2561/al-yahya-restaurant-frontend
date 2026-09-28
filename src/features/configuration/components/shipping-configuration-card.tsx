'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { configurationApi } from '../api/configuration.api';
import { useUpdateConfigurationMutation } from '../hooks/use-update-configuration-mutation';
import {
  shippingConfigurationSchema,
  type ShippingConfigurationInput,
} from '../schemas/configuration.schema';
import { DIMENSION_UNITS, WEIGHT_UNITS, type Configuration } from '../types/configuration';
import { ConfigurationCard } from './configuration-card';

export function ShippingConfigurationCard({ configuration }: { configuration: Configuration }) {
  const t = useTranslations('settings.configuration');
  const mutation = useUpdateConfigurationMutation(configurationApi.updateShipping);

  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<ShippingConfigurationInput>({
    resolver: zodResolver(shippingConfigurationSchema),
    defaultValues: {
      shippingWeightUnit: configuration.shippingWeightUnit,
      shippingDimensionUnit: configuration.shippingDimensionUnit,
    },
  });

  return (
    <ConfigurationCard
      title={t('shipping.title')}
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      canSave={isDirty && !mutation.isPending}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{t('shipping.weightUnit')}</Label>
          <Controller
            control={control}
            name="shippingWeightUnit"
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
          <Label>{t('shipping.dimensionUnit')}</Label>
          <Controller
            control={control}
            name="shippingDimensionUnit"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue>{t(`dimensionUnits.${field.value}`)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DIMENSION_UNITS).map((value) => (
                    <SelectItem key={value} value={value}>
                      {t(`dimensionUnits.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
    </ConfigurationCard>
  );
}
