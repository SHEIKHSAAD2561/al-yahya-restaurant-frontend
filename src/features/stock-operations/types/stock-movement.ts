export const STOCK_MOVEMENT_TYPES = { IN: 'IN', OUT: 'OUT' } as const;
export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[keyof typeof STOCK_MOVEMENT_TYPES];

export const STOCK_MOVEMENT_STATUSES = { DRAFT: 'DRAFT', CONFIRMED: 'CONFIRMED' } as const;
export type StockMovementStatus = (typeof STOCK_MOVEMENT_STATUSES)[keyof typeof STOCK_MOVEMENT_STATUSES];

export interface StockMovementListItem {
  id: string;
  type: StockMovementType;
  status: StockMovementStatus;
  locationId: string;
  locationName: string;
  reason: string;
  movementDate: string;
  createdAt: string;
}

export interface StockMovementListPage {
  items: StockMovementListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface StockMovementLine {
  id: string;
  variantId: string;
  productName: string;
  sku: string;
  quantity: number;
}

export interface StockMovement {
  id: string;
  type: StockMovementType;
  status: StockMovementStatus;
  locationId: string;
  location?: { id: string; name: string };
  reason: string;
  movementDate: string;
  lines: StockMovementLine[];
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
}
