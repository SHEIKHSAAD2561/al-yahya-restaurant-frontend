import type { ProductInput, ProductVariantInput } from '../api/products.api';
import {
  PRODUCT_TYPES,
  type Product,
  type ProductFormOptions,
  type ProductType,
  type ProductVariant,
} from '../types/product';
import type {
  LocationRowFormValues,
  ProductFormValues,
  VariantFormValues,
} from '../schemas/product-form.schema';

export const DEFAULT_REORDER_POINT = 5;

const toText = (value: number | null | undefined) =>
  value === null || value === undefined ? '' : String(value);
const toNumberOrNull = (value: string) => (value.trim() === '' ? null : Number(value));

/** One row per active location, merged with whatever the variant already has.
 * A location added after the product was saved shows up blank here. */
export function buildLocationRows(
  formOptions: ProductFormOptions,
  variant?: ProductVariant,
): LocationRowFormValues[] {
  return formOptions.locations.map((location) => {
    const saved = variant?.locations.find((row) => row.locationId === location.id);
    return {
      locationId: location.id,
      locationName: location.name,
      quantity: '',
      currentQuantity: variant ? saved?.quantity : undefined,
      retailPrice: toText(saved?.retailPrice),
      wholesalePrice: toText(saved?.wholesalePrice),
      buyPrice: toText(saved?.buyPrice),
      taxId: saved ? (saved.taxId ?? '') : (formOptions.defaultTaxId ?? ''),
    };
  });
}

export function blankVariant(
  formOptions: ProductFormOptions,
  optionValues: string[] | null = null,
): VariantFormValues {
  return {
    label: optionValues?.join(' / ') ?? '',
    optionValues,
    sku: '',
    barcode: '',
    cost: '',
    locations: buildLocationRows(formOptions),
  };
}

export function newProductDefaults(
  type: ProductType,
  formOptions: ProductFormOptions,
): ProductFormValues {
  const isComposite = type === PRODUCT_TYPES.COMPOSITE;
  return {
    type,
    name: '',
    description: '',
    isSellable: true,
    isPurchasable: !isComposite,
    trackQuantity: !isComposite,
    isWeighted: false,
    reorderPoint: DEFAULT_REORDER_POINT,
    categoryId: '',
    brandId: '',
    shippingWeight: '',
    shippingLength: '',
    shippingWidth: '',
    shippingHeight: '',
    imageUrls: [],
    options: [],
    // A VARIABLE product gets its variants once options are entered.
    variants: type === PRODUCT_TYPES.VARIABLE ? [] : [blankVariant(formOptions)],
    components: [],
  };
}

export function productDefaults(product: Product, formOptions: ProductFormOptions): ProductFormValues {
  return {
    type: product.type,
    name: product.name,
    description: product.description ?? '',
    isSellable: product.isSellable,
    isPurchasable: product.isPurchasable,
    trackQuantity: product.trackQuantity,
    isWeighted: product.isWeighted,
    reorderPoint: product.reorderPoint ?? DEFAULT_REORDER_POINT,
    categoryId: product.categoryId ?? '',
    brandId: product.brandId ?? '',
    shippingWeight: toText(product.shippingWeight),
    shippingLength: toText(product.shippingLength),
    shippingWidth: toText(product.shippingWidth),
    shippingHeight: toText(product.shippingHeight),
    imageUrls: product.imageUrls,
    options: product.options,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      label: variant.optionValues?.join(' / ') ?? '',
      optionValues: variant.optionValues,
      sku: variant.sku,
      barcode: variant.barcode ?? '',
      cost: '',
      currentCost: variant.cost,
      locations: buildLocationRows(formOptions, variant),
    })),
    components: product.components.map((component) => ({
      variantId: component.variantId,
      name: component.name,
      sku: component.sku,
      cost: component.cost,
      quantity: String(component.quantity),
    })),
  };
}

/** Every combination of the options' values, in option order. */
export function optionCombinations(options: ProductFormValues['options']): string[][] {
  return options.reduce<string[][]>(
    (combinations, option) =>
      combinations.flatMap((combination) => option.values.map((value) => [...combination, value])),
    [[]],
  );
}

const combinationKey = (values: string[] | null) =>
  (values ?? []).map((value) => value.trim().toLowerCase()).join('\u0000');

/** Re-derive a VARIABLE product's variants after its options changed —
 * keeping each surviving combination's existing SKU/prices/id. */
export function syncVariantsWithOptions(
  options: ProductFormValues['options'],
  current: VariantFormValues[],
  formOptions: ProductFormOptions,
): VariantFormValues[] {
  const usable = options.filter((option) => option.name.trim() && option.values.length > 0);
  if (usable.length === 0) return [];
  const existing = new Map(current.map((variant) => [combinationKey(variant.optionValues), variant]));
  return optionCombinations(usable).map((values) => {
    const kept = existing.get(combinationKey(values));
    return kept
      ? { ...kept, optionValues: values, label: values.join(' / ') }
      : blankVariant(formOptions, values);
  });
}

export function toProductInput(
  values: ProductFormValues,
  permissions: { canViewCost: boolean; canSetStock: boolean },
): ProductInput {
  const isComposite = values.type === PRODUCT_TYPES.COMPOSITE;

  const variants: ProductVariantInput[] = values.variants.map((variant) => {
    const isNew = !variant.id;
    return {
      ...(variant.id ? { id: variant.id } : {}),
      optionValues: values.type === PRODUCT_TYPES.VARIABLE ? variant.optionValues : null,
      sku: variant.sku.trim(),
      barcode: variant.barcode.trim() || null,
      // The backend ignores these unless allowed; sending them only when
      // meaningful keeps the payload honest.
      ...(isNew && permissions.canViewCost && !isComposite ? { cost: Number(variant.cost) || 0 } : {}),
      locations: variant.locations.map((row) => ({
        locationId: row.locationId,
        retailPrice: toNumberOrNull(row.retailPrice),
        wholesalePrice: toNumberOrNull(row.wholesalePrice),
        taxId: row.taxId || null,
        ...(permissions.canViewCost && !isComposite ? { buyPrice: toNumberOrNull(row.buyPrice) } : {}),
        ...(isNew && permissions.canSetStock && !isComposite ? { quantity: Number(row.quantity) || 0 } : {}),
      })),
    };
  });

  return {
    name: values.name.trim(),
    description: values.description.trim() || null,
    isSellable: values.isSellable,
    isPurchasable: values.isPurchasable,
    trackQuantity: values.trackQuantity,
    isWeighted: values.isWeighted,
    reorderPoint: isComposite ? null : values.reorderPoint,
    categoryId: values.categoryId || null,
    brandId: values.brandId || null,
    shippingWeight: toNumberOrNull(values.shippingWeight),
    shippingLength: toNumberOrNull(values.shippingLength),
    shippingWidth: toNumberOrNull(values.shippingWidth),
    shippingHeight: toNumberOrNull(values.shippingHeight),
    imageUrls: values.imageUrls,
    options: values.type === PRODUCT_TYPES.VARIABLE ? values.options : [],
    variants,
    components: isComposite
      ? values.components.map((component) => ({
          variantId: component.variantId,
          quantity: Number(component.quantity),
        }))
      : [],
  };
}
