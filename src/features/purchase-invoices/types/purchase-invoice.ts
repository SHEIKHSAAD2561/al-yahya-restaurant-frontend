export const PURCHASE_INVOICE_STATUSES = { DRAFT: 'DRAFT', CONFIRMED: 'CONFIRMED' } as const;
export type PurchaseInvoiceStatus = (typeof PURCHASE_INVOICE_STATUSES)[keyof typeof PURCHASE_INVOICE_STATUSES];

export interface PurchaseInvoiceListItem {
  id: string;
  invoiceNumber: string | null;
  status: PurchaseInvoiceStatus;
  supplierId: string;
  supplierName: string;
  locationId: string;
  locationName: string;
  invoiceDate: string;
  total: number;
  createdAt: string;
}

export interface PurchaseInvoiceListPage {
  items: PurchaseInvoiceListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PurchaseInvoiceLine {
  id: string;
  variantId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  taxId: string | null;
  taxRate: number;
  lineSubtotal: number;
  lineTax: number;
  lineTotal: number;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string | null;
  status: PurchaseInvoiceStatus;
  supplierId: string;
  supplier?: { id: string; name: string };
  locationId: string;
  location?: { id: string; name: string };
  invoiceDate: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes: string | null;
  lines: PurchaseInvoiceLine[];
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
}
