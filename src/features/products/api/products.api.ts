import { backendDownload, backendFetch } from '@/core/api/backend-fetch-client';
import type {
  Product,
  ProductFormOptions,
  ProductImportResult,
  ProductListPage,
  ProductSort,
  ProductType,
} from '../types/product';

export interface ProductsQuery {
  search?: string;
  type?: ProductType;
  categoryId?: string;
  /** Category Management's "Uncategorized" bucket — ignored if categoryId is set. */
  uncategorized?: boolean;
  excludeComposite?: boolean;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

export interface VariantLocationInput {
  locationId: string;
  quantity?: number;
  retailPrice: number | null;
  wholesalePrice: number | null;
  buyPrice?: number | null;
  taxId: string | null;
}

export interface ProductVariantInput {
  id?: string;
  optionValues: string[] | null;
  sku: string;
  barcode: string | null;
  cost?: number;
  locations: VariantLocationInput[];
}

/** The whole product — the backend replaces it wholesale on update. */
export interface ProductInput {
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
  options: { name: string; values: string[] }[];
  variants: ProductVariantInput[];
  components: { variantId: string; quantity: number }[];
}

export interface BulkPricingItemInput {
  variantId: string;
  retailPrice?: number | null;
  wholesalePrice?: number | null;
  buyPrice?: number | null;
  taxId?: string | null;
  reorderPoint?: number | null;
}

export interface BulkUpdatePricingInput {
  locationId: string;
  items: BulkPricingItemInput[];
}

function exportSearchParams(query: ProductsQuery) {
  return {
    search: query.search || undefined,
    type: query.type,
    categoryId: query.categoryId,
    uncategorized: query.uncategorized ? 'true' : undefined,
    excludeComposite: query.excludeComposite ? 'true' : undefined,
    sort: query.sort,
    page: query.page?.toString(),
    pageSize: query.pageSize?.toString(),
  };
}

export const productsApi = {
  list: (query: ProductsQuery = {}) =>
    backendFetch<ProductListPage>('products', { searchParams: exportSearchParams(query) }),
  get: (id: string) => backendFetch<Product>(`products/${id}`),
  formOptions: () => backendFetch<ProductFormOptions>('products/form-options'),
  generateSku: () => backendFetch<{ sku: string }>('products/generate-sku'),
  create: (input: ProductInput & { type: ProductType }) =>
    backendFetch<Product>('products', { method: 'POST', body: input }),
  update: (id: string, input: ProductInput) =>
    backendFetch<Product>(`products/${id}`, { method: 'PATCH', body: input }),
  remove: (id: string) => backendFetch<void>(`products/${id}`, { method: 'DELETE' }),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return backendFetch<{ url: string }>('products/images', { method: 'POST', body: formData });
  },
  /** Same filters as the list — "give me everything that currently matches",
   * not one page. Returns the raw CSV file (see backendDownload). */
  exportCsv: (query: ProductsQuery = {}) => backendDownload('products/export', exportSearchParams(query)),
  importCsv: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return backendFetch<ProductImportResult>('products/import', { method: 'POST', body: formData });
  },
  bulkUpdatePricing: (input: BulkUpdatePricingInput) =>
    backendFetch<{ updated: number }>('products/bulk-pricing', { method: 'PATCH', body: input }),
};
