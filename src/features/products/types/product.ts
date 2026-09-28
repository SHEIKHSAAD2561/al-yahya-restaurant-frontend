/** Mirrors al-yahya-restaurant-backend/src/modules/products/product-type.enum.ts. */
export const PRODUCT_TYPES = {
  SIMPLE: 'SIMPLE',
  VARIABLE: 'VARIABLE',
  COMPOSITE: 'COMPOSITE',
} as const;

export type ProductType = (typeof PRODUCT_TYPES)[keyof typeof PRODUCT_TYPES];

export const PRODUCT_SORTS = ['CREATED_DESC', 'CREATED_ASC', 'NAME_ASC', 'NAME_DESC'] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

/** One row of the products list — a *variant* (SIMPLE/COMPOSITE have one,
 * VARIABLE one per option combination), hence the "Main Product" column.
 * `quantity`/`cost` are omitted by the backend without `stock.access` /
 * `products.view_cost`. */
export interface ProductListItem {
  variantId: string;
  productId: string;
  productType: ProductType;
  name: string;
  mainProductName: string;
  imageUrl: string | null;
  categoryName: string | null;
  sku: string;
  barcode: string | null;
  quantity?: number;
  cost?: number;
  retailPrice: number | null;
  wholesalePrice: number | null;
  taxName: string | null;
}

export interface ProductListPage {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface VariantLocation {
  locationId: string;
  retailPrice: number | null;
  wholesalePrice: number | null;
  taxId: string | null;
  /** Only with `products.view_cost`. */
  buyPrice?: number | null;
  /** Only with `stock.access` for this location. For a COMPOSITE, the derived
   * "max to sell". */
  quantity?: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  optionValues: string[] | null;
  sku: string;
  barcode: string | null;
  /** Only with `products.view_cost`. Derived for a COMPOSITE. */
  cost?: number;
  locations: VariantLocation[];
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface CompositeComponent {
  variantId: string;
  quantity: number;
  name: string;
  sku: string;
  cost?: number;
}

export interface Product {
  id: string;
  type: ProductType;
  name: string;
  description: string | null;
  isSellable: boolean;
  isPurchasable: boolean;
  trackQuantity: boolean;
  isWeighted: boolean;
  reorderPoint: number | null;
  categoryId: string | null;
  brandId: string | null;
  shippingWeight: number | null;
  shippingLength: number | null;
  shippingWidth: number | null;
  shippingHeight: number | null;
  imageUrls: string[];
  options: ProductOption[];
  components: CompositeComponent[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

/** GET /products/form-options — a narrow projection of settings the form needs. */
export interface ProductFormOptions {
  locations: { id: string; name: string; isDefault: boolean }[];
  taxes: { id: string; name: string }[];
  defaultTaxId: string | null;
  sellTaxStatus: 'INCLUSIVE' | 'EXCLUSIVE';
  costTaxStatus: 'INCLUSIVE' | 'EXCLUSIVE';
  shippingWeightUnit: 'KG' | 'G' | 'LB' | 'OZ';
  shippingDimensionUnit: 'CM' | 'M' | 'FT' | 'IN';
}

export interface ProductImportRowResult {
  row: number;
  sku: string;
  status: 'created' | 'error';
  message?: string;
}

export interface ProductImportResult {
  imported: number;
  total: number;
  results: ProductImportRowResult[];
}
