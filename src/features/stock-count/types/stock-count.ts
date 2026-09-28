export const STOCK_COUNT_STATUSES = { DRAFT: 'DRAFT', CONFIRMED: 'CONFIRMED' } as const;
export type StockCountStatus = (typeof STOCK_COUNT_STATUSES)[keyof typeof STOCK_COUNT_STATUSES];

export interface StockCountListItem {
  id: string;
  status: StockCountStatus;
  locationId: string;
  locationName: string;
  countDate: string;
  createdAt: string;
}

export interface StockCountListPage {
  items: StockCountListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface StockCountLine {
  id: string;
  variantId: string;
  productName: string;
  sku: string;
  expectedQuantity: number;
  countedQuantity: number | null;
}

export interface StockCount {
  id: string;
  status: StockCountStatus;
  locationId: string;
  location?: { id: string; name: string };
  countDate: string;
  lines: StockCountLine[];
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
}
