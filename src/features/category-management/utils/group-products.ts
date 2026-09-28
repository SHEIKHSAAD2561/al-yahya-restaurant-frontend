import type { ProductListItem } from '@/features/products/types/product';

/** Category Management shows one row per *product*, not per variant (unlike
 * the main Products list) — group the variant-level rows the shared
 * `GET /products` endpoint returns back into their parent product. */
export interface ProductGroup {
  productId: string;
  name: string;
  type: ProductListItem['productType'];
  imageUrl: string | null;
  variants: ProductListItem[];
}

export function groupProductsByProduct(items: ProductListItem[]): ProductGroup[] {
  const groups = new Map<string, ProductGroup>();
  for (const item of items) {
    let group = groups.get(item.productId);
    if (!group) {
      group = { productId: item.productId, name: item.mainProductName, type: item.productType, imageUrl: item.imageUrl, variants: [] };
      groups.set(item.productId, group);
    }
    group.variants.push(item);
  }
  return [...groups.values()];
}
