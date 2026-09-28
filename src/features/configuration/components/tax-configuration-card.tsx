'use client';

import { Info } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Tax } from '@/features/taxes/types/tax';
import { configurationApi } from '../api/configuration.api';
import { useUpdateConfigurationMutation } from '../hooks/use-update-configuration-mutation';
import { taxConfigurationSchema, type TaxConfigurationInput } from '../schemas/configuration.schema';
import { TAX_STATUSES, type Configuration } from '../types/configuration';
import { ConfigurationCard } from './configuration-card';

export function TaxConfigurationCard({
  configuration,
  taxes,
}: {
  configuration: Configuration;
  taxes: Tax[];
}) {
  const t = useTranslations('settings.configuration');
  const mutation = useUpdateConfigurationMutation(configurationApi.updateTax);
  const locked = configuration.sellTaxStatusLocked;

  // Inactive taxes can't be the default — so "VAT + Tobacco Tax" only shows
  // up here once it's been activated on the Taxes tab.
  const taxOptions = taxes.filter((tax) => tax.isActive);
  const taxName = (id: string) => taxes.find((tax) => tax.id === id)?.name;

  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<TaxConfigurationInput>({
    resolver: zodResolver(taxConfigurationSchema),
    defaultValues: {
      defaultTaxId: configuration.defaultTaxId ?? '',
      sellTaxStatus: locked ? TAX_STATUSES.EXCLUSIVE : configuration.sellTaxStatus,
    },
  });

  return (
    <ConfigurationCard
      title={t('tax.title')}
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      canSave={isDirty && !mutation.isPending}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{t('tax.defaultTax')}</Label>
          <Controller
            control={control}
            name="defaultTaxId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectPlaceholder')}>
                    {field.value ? taxName(field.value) : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {taxOptions.map((tax) => (
                    <SelectItem key={tax.id} value={tax.id}>
                      {tax.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>{t('tax.sellTaxStatus')}</Label>
          <Controller
            control={control}
            name="sellTaxStatus"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={locked}>
                <SelectTrigger>
                  <SelectValue>{t(`taxStatuses.${field.value}`)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TAX_STATUSES).map((value) => (
                    <SelectItem key={value} value={value}>
                      {t(`taxStatuses.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {locked && (
            <p className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Info className="size-3.5 shrink-0" />
              {t('tax.sellTaxStatusLocked')}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="costTaxStatus">{t('tax.costTaxStatus')}</Label>
          {/* Purchase costs are always tax-exclusive — nothing to choose. */}
          <Input
            id="costTaxStatus"
            value={t(`taxStatuses.${configuration.costTaxStatus}`)}
            readOnly
            disabled
          />
        </div>
      </div>
    </ConfigurationCard>
  );
}
