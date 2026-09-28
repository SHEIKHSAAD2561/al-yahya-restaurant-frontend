/** Mirrors al-yahya-restaurant-backend/src/modules/configuration/configuration.enums.ts. */
export const TAX_STATUSES = { INCLUSIVE: 'INCLUSIVE', EXCLUSIVE: 'EXCLUSIVE' } as const;
export type TaxStatus = (typeof TAX_STATUSES)[keyof typeof TAX_STATUSES];

export const WEIGHT_UNITS = { KG: 'KG', G: 'G', LB: 'LB', OZ: 'OZ' } as const;
export type WeightUnit = (typeof WEIGHT_UNITS)[keyof typeof WEIGHT_UNITS];

export const DIMENSION_UNITS = { CM: 'CM', M: 'M', FT: 'FT', IN: 'IN' } as const;
export type DimensionUnit = (typeof DIMENSION_UNITS)[keyof typeof DIMENSION_UNITS];

export const BARCODE_VALUE_TYPES = { WEIGHT: 'WEIGHT', PRICE: 'PRICE' } as const;
export type BarcodeValueType = (typeof BARCODE_VALUE_TYPES)[keyof typeof BARCODE_VALUE_TYPES];

export interface Configuration {
  defaultTaxId: string | null;
  sellTaxStatus: TaxStatus;
  /** Always EXCLUSIVE — shown read-only. */
  costTaxStatus: TaxStatus;
  /** True while "VAT + Tobacco Tax" is active: sell tax status is then fixed
   * to EXCLUSIVE (the backend rejects INCLUSIVE too). */
  sellTaxStatusLocked: boolean;
  /** The location with `isDefault` — same data the Locations tab edits. */
  defaultLocationId: string | null;
  weightUnit: WeightUnit;
  barcodeValueType: BarcodeValueType;
  barcodePrefix: number;
  /** Fixed by the backend (3) — shown read-only. */
  weightDecimalDigits: number;
  barcodeHasCheckDigit: boolean;
  shippingWeightUnit: WeightUnit;
  shippingDimensionUnit: DimensionUnit;
  /** A row from Settings → Payment Methods. */
  defaultPaymentMethodId: string | null;
  updatedAt: string;
}

export interface LocationOption {
  id: string;
  name: string;
}
