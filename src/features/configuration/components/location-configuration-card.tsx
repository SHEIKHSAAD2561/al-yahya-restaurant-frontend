'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { configurationApi } from '../api/configuration.api';
import { useUpdateConfigurationMutation } from '../hooks/use-update-configuration-mutation';
import {
  locationConfigurationSchema,
  type LocationConfigurationInput,
} from '../schemas/configuration.schema';
import type { Configuration, LocationOption } from '../types/configuration';
import { ConfigurationCard } from './configuration-card';

export function LocationConfigurationCard({
  configuration,
  locations,
}: {
  configuration: Configuration;
  locations: LocationOption[];
}) {
  const t = useTranslations('settings.configuration');
  const mutation = useUpdateConfigurationMutation(configurationApi.updateLocation);
  const locationName = (id: string) => locations.find((location) => location.id === id)?.name;

  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<LocationConfigurationInput>({
    resolver: zodResolver(locationConfigurationSchema),
    defaultValues: { defaultLocationId: configuration.defaultLocationId ?? '' },
  });

  return (
    <ConfigurationCard
      title={t('location.title')}
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      canSave={isDirty && !mutation.isPending}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{t('location.defaultLocation')}</Label>
          <Controller
            control={control}
            name="defaultLocationId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectPlaceholder')}>
                    {field.value ? locationName(field.value) : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
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
