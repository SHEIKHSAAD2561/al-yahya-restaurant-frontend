import { z } from 'zod';
import { PRODUCT_TYPES } from '../types/product';

/** '' (left blank) or a non-negative number, as typed into an <input>. */
const amount = z
  .string()
  .refine((value) => value.trim() === '' || (Number.isFinite(Number(value)) && Number(value) >= 0), {
    message: 'invalid',
  });

const locationRowSchema = z.object({
  locationId: z.string(),
  locationName: z.string(),
  /** Initial quantity — only editable while the variant is new. */
  quantity: amount,
  /** Display-only stock for an already-saved variant (undefined = hidden). */
  currentQuantity: z.number().optional(),
  retailPrice: amount,
  wholesalePrice: amount,
  buyPrice: amount,
  taxId: z.string(),
});

const variantSchema = z.object({
  id: z.string().optional(),
  /** Label for VARIABLE variants ("Red / L"); unused otherwise. */
  label: z.string(),
  optionValues: z.array(z.string()).nullable(),
  sku: z.string().trim().min(1).max(50),
  barcode: z.string().trim().max(50),
  /** Initial cost — only editable while the variant is new. */
  cost: amount,
  /** Display-only saved cost (undefined = hidden or new). */
  currentCost: z.number().optional(),
  locations: z.array(locationRowSchema),
});

const componentSchema = z.object({
  variantId: z.string(),
  name: z.string(),
  sku: z.string(),
  cost: z.number().optional(),
  quantity: z
    .string()
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, { message: 'invalid' }),
});

export const productFormSchema = z
  .object({
    type: z.enum(PRODUCT_TYPES),
    name: z.string().trim().min(1).max(150),
    description: z.string().max(2000),
    isSellable: z.boolean(),
    isPurchasable: z.boolean(),
    trackQuantity: z.boolean(),
    isWeighted: z.boolean(),
    reorderPoint: z.number().int().min(0),
    categoryId: z.string(),
    brandId: z.string(),
    shippingWeight: amount,
    shippingLength: amount,
    shippingWidth: amount,
    shippingHeight: amount,
    imageUrls: z.array(z.string()),
    options: z.array(z.object({ name: z.string().trim().min(1).max(50), values: z.array(z.string()).min(1) })),
    variants: z.array(variantSchema).min(1),
    components: z.array(componentSchema),
  })
  .superRefine((values, ctx) => {
    if (values.type === PRODUCT_TYPES.VARIABLE && values.options.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['options'], message: 'required' });
    }
    if (values.type === PRODUCT_TYPES.COMPOSITE && values.components.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['components'], message: 'required' });
    }
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;
export type VariantFormValues = ProductFormValues['variants'][number];
export type LocationRowFormValues = VariantFormValues['locations'][number];
export type ComponentFormValues = ProductFormValues['components'][number];
