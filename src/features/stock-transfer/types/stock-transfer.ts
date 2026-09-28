export const STOCK_TRANSFER_STATUSES = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const;
export type StockTransferStatus = (typeof STOCK_TRANSFER_STATUSES)[keyof typeof STOCK_TRANSFER_STATUSES];

export interface StockTransferListItem {
  id: string;
  status: StockTransferStatus;
  fromLocationId: string;
  fromLocationName: string;
  toLocationId: string;
  toLocationName: string;
  requestedByName: string;
  createdAt: string;
}

export interface StockTransferListPage {
  items: StockTransferListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface StockTransferLine {
  id: string;
  variantId: string;
  productName: string;
  sku: string;
  quantity: number;
}

export interface StockTransfer {
  id: string;
  status: StockTransferStatus;
  fromLocationId: string;
  fromLocation?: { id: string; name: string };
  toLocationId: string;
  toLocation?: { id: string; name: string };
  notes: string | null;
  requestedByUserId: string;
  requestedBy?: { id: string; nameEn: string; nameAr: string };
  respondedByUserId: string | null;
  respondedAt: string | null;
  lines: StockTransferLine[];
  createdAt: string;
  updatedAt: string;
}
