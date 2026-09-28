'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { configurationApi } from '../api/configuration.api';
import { useUpdateConfigurationMutation } from '../hooks/use-update-configuration-mutation';
import {
  paymentConfigurationSchema,
  type PaymentConfigurationInput,
} from '../schemas/configuration.schema';
import type { Configuration } from '../types/configuration';
import type { PaymentMethod } from '@/features/payment-methods/types/payment-method';
import { ConfigurationCard } from './configuration-card';

export function PaymentConfigurationCard({
  configuration,
  paymentMethods,
}: {
  configuration: Configuration;
  paymentMethods: PaymentMethod[];
}) {
  const t = useTranslations('settings.configuration');
  const mutation = useUpdateConfigurationMutation(configurationApi.updatePayment);
  const methodName = (id: string) => paymentMethods.find((method) => method.id === id)?.name;

  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<PaymentConfigurationInput>({
    resolver: zodResolver(paymentConfigurationSchema),
    defaultValues: { defaultPaymentMethodId: configuration.defaultPaymentMethodId ?? '' },
  });

  return (
    <ConfigurationCard
      title={t('payment.title')}
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      canSave={isDirty && !mutation.isPending}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{t('payment.defaultPaymentMethod')}</Label>
          <Controller
            control={control}
            name="defaultPaymentMethodId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectPlaceholder')}>
                    {field.value ? methodName(field.value) : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name}
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
