export interface CartLine {
  variantId: string;
  name: string;
  sku: string;
  imageUrl: string | null;
  /** Retail or wholesale price for the cart's current `sellAt`. */
  unitPrice: number;
  quantity: number;
}
