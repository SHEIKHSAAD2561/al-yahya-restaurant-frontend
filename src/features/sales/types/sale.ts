export const SALE_STATUSES = { PARKED: 'PARKED', COMPLETED: 'COMPLETED' } as const;
export type SaleStatus = (typeof SALE_STATUSES)[keyof typeof SALE_STATUSES];

export const SELL_AT = { RETAIL: 'RETAIL', WHOLESALE: 'WHOLESALE' } as const;
export type SellAt = (typeof SELL_AT)[keyof typeof SELL_AT];

export const DISCOUNT_TYPES = { PERCENT: 'PERCENT', AMOUNT: 'AMOUNT' } as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[keyof typeof DISCOUNT_TYPES];

export interface SaleLine {
  id: string;
  variantId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  taxId: string | null;
  taxRate: number;
  lineSubtotal: number;
  lineTax: number;
  lineTotal: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string | null;
  status: SaleStatus;
  customerId: string | null;
  /** Only populated by GET /sales/parked/:id (resuming needs a name to show,
   * not just the id) and GET /sales/:id. */
  customerName?: string | null;
  sellAt: SellAt;
  discountType: DiscountType | null;
  discountValue: number | null;
  note: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  paymentMethodId: string | null;
  /** Only populated by GET /sales/:id. */
  paymentMethodName?: string | null;
  /** Only populated by GET /sales/:id. */
  cashierName?: string;
  amountPaid: number | null;
  amountTendered: number | null;
  lines: SaleLine[];
  createdAt: string;
  completedAt: string | null;
}

export interface ParkedSaleSummary {
  id: string;
  customerName: string | null;
  itemCount: number;
  total: number;
  parkedAt: string;
}

export interface SaleListItem {
  id: string;
  invoiceNumber: string | null;
  createdAt: string;
  paymentMethodName: string;
  customerName: string | null;
  locationId: string;
  locationName: string;
  sellAt: SellAt;
  total: number;
  amountPaid: number | null;
  status: SaleStatus;
}

export interface SaleListPage {
  items: SaleListItem[];
  total: number;
  page: number;
  pageSize: number;
}
