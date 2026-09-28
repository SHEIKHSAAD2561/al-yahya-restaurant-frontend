import { z } from 'zod';
import {
  BARCODE_VALUE_TYPES,
  DIMENSION_UNITS,
  TAX_STATUSES,
  WEIGHT_UNITS,
} from '../types/configuration';

export const taxConfigurationSchema = z.object({
  defaultTaxId: z.string().min(1),
  sellTaxStatus: z.enum(TAX_STATUSES),
});
export type TaxConfigurationInput = z.infer<typeof taxConfigurationSchema>;

export const locationConfigurationSchema = z.object({
  defaultLocationId: z.string().min(1),
});
export type LocationConfigurationInput = z.infer<typeof locationConfigurationSchema>;

/** GS1 in-store barcode prefixes are 20–29 (matches the backend DTO). */
export const BARCODE_PREFIX_MIN = 20;
export const BARCODE_PREFIX_MAX = 29;

export const weightedProductConfigurationSchema = z.object({
  weightUnit: z.enum(WEIGHT_UNITS),
  barcodeValueType: z.enum(BARCODE_VALUE_TYPES),
  barcodePrefix: z.number().int().min(BARCODE_PREFIX_MIN).max(BARCODE_PREFIX_MAX),
  barcodeHasCheckDigit: z.boolean(),
});
export type WeightedProductConfigurationInput = z.infer<typeof weightedProductConfigurationSchema>;

export const shippingConfigurationSchema = z.object({
  shippingWeightUnit: z.enum(WEIGHT_UNITS),
  shippingDimensionUnit: z.enum(DIMENSION_UNITS),
});
export type ShippingConfigurationInput = z.infer<typeof shippingConfigurationSchema>;

export const paymentConfigurationSchema = z.object({
  defaultPaymentMethodId: z.string().min(1),
});
export type PaymentConfigurationInput = z.infer<typeof paymentConfigurationSchema>;
