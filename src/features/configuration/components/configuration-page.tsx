'use client';

import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Checkbox } from '@/components/ui/checkbox';
import { QueryErrorState } from '@/components/ui/query-error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useTaxesQuery } from '@/features/taxes/hooks/use-taxes-query';
import { usePaymentMethodsQuery } from '@/features/payment-methods/hooks/use-payment-methods-query';
import { useConfigurationQuery } from '../hooks/use-configuration-query';
import { useLocationOptionsQuery } from '../hooks/use-location-options-query';
import { ConfigurationCard } from './configuration-card';
import { TaxConfigurationCard } from './tax-configuration-card';
import { LocationConfigurationCard } from './location-configuration-card';
import { WeightedProductConfigurationCard } from './weighted-product-configuration-card';
import { ShippingConfigurationCard } from './shipping-configuration-card';
import { PaymentConfigurationCard } from './payment-configuration-card';

export function ConfigurationPage() {
  const t = useTranslations('settings.configuration');
  const configurationQuery = useConfigurationQuery();
  const taxesQuery = useTaxesQuery();
  const locationOptionsQuery = useLocationOptionsQuery();
  const paymentMethodsQuery = usePaymentMethodsQuery();

  if (configurationQuery.isPending ||
    taxesQuery.isPending ||
    locationOptionsQuery.isPending ||
    paymentMethodsQuery.isPending) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-48 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (configurationQuery.isError || !configurationQuery.data) {
    return <QueryErrorState onRetry={() => void configurationQuery.refetch()} />;
  }
  const configuration = configurationQuery.data;

  // Each card is keyed by its own saved values, so a save (or an outside
  // change, e.g. activating VAT + Tobacco on the Taxes tab, or moving the
  // default on the Locations tab) remounts just that card with fresh
  // `defaultValues` — never reset()-in-an-effect (see CLAUDE.md: Controller-
  // bound <Select>s don't reliably re-render from that here).
  return (
    <div className="space-y-6">
      <TaxConfigurationCard
        key={`${configuration.defaultTaxId}|${configuration.sellTaxStatus}|${configuration.sellTaxStatusLocked}`}
        configuration={configuration}
        taxes={taxesQuery.data ?? []}
      />
      <LocationConfigurationCard
        key={configuration.defaultLocationId ?? 'none'}
        configuration={configuration}
        locations={locationOptionsQuery.data ?? []}
      />
      <WeightedProductConfigurationCard
        key={`${configuration.weightUnit}|${configuration.barcodeValueType}|${configuration.barcodePrefix}|${configuration.barcodeHasCheckDigit}`}
        configuration={configuration}
      />
      <ShippingConfigurationCard
        key={`${configuration.shippingWeightUnit}|${configuration.shippingDimensionUnit}`}
        configuration={configuration}
      />
      <PaymentConfigurationCard
        key={configuration.defaultPaymentMethodId ?? 'none'}
        configuration={configuration}
        paymentMethods={paymentMethodsQuery.data ?? []}
      />

      {/* Display-only until an accounting integration exists to change it. */}
      <ConfigurationCard title={t('editQuantity.title')}>
        <label className="flex w-fit items-center gap-2 text-sm text-zinc-700">
          <Checkbox checked disabled />
          {t('editQuantity.disableEditing')}
        </label>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-zinc-600">
          <Info className="size-3.5 shrink-0" />
          {t('editQuantity.notChangeable')}
        </p>
      </ConfigurationCard>
    </div>
  );
}
