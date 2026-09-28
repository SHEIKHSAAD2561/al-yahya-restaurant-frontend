import { backendFetch } from '@/core/api/backend-fetch-client';
import type {
  BarcodeValueType,
  Configuration,
  DimensionUnit,
  LocationOption,
  TaxStatus,
  WeightUnit,
} from '../types/configuration';

export interface UpdateTaxConfigurationInput {
  defaultTaxId: string;
  sellTaxStatus: TaxStatus;
}

export interface UpdateLocationConfigurationInput {
  defaultLocationId: string;
}

export interface UpdateWeightedProductConfigurationInput {
  weightUnit: WeightUnit;
  barcodeValueType: BarcodeValueType;
  barcodePrefix: number;
  barcodeHasCheckDigit: boolean;
}

export interface UpdateShippingConfigurationInput {
  shippingWeightUnit: WeightUnit;
  shippingDimensionUnit: DimensionUnit;
}

export interface UpdatePaymentConfigurationInput {
  defaultPaymentMethodId: string;
}

/** One PATCH per card — each section of the page saves independently. */
export const configurationApi = {
  get: () => backendFetch<Configuration>('configuration'),
  locationOptions: () => backendFetch<LocationOption[]>('configuration/location-options'),
  updateTax: (input: UpdateTaxConfigurationInput) =>
    backendFetch<Configuration>('configuration/tax', { method: 'PATCH', body: input }),
  updateLocation: (input: UpdateLocationConfigurationInput) =>
    backendFetch<Configuration>('configuration/location', { method: 'PATCH', body: input }),
  updateWeightedProduct: (input: UpdateWeightedProductConfigurationInput) =>
    backendFetch<Configuration>('configuration/weighted-product', { method: 'PATCH', body: input }),
  updateShipping: (input: UpdateShippingConfigurationInput) =>
    backendFetch<Configuration>('configuration/shipping', { method: 'PATCH', body: input }),
  updatePayment: (input: UpdatePaymentConfigurationInput) =>
    backendFetch<Configuration>('configuration/payment', { method: 'PATCH', body: input }),
};
