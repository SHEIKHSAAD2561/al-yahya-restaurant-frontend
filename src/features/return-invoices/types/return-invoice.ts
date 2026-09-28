export const RETURN_INVOICE_STATUSES = { DRAFT: 'DRAFT', CONFIRMED: 'CONFIRMED' } as const;
export type ReturnInvoiceStatus = (typeof RETURN_INVOICE_STATUSES)[keyof typeof RETURN_INVOICE_STATUSES];

export interface ReturnInvoiceListItem {
  id: string;
  returnNumber: string | null;
  status: ReturnInvoiceStatus;
  supplierId: string;
  supplierName: string;
  locationId: string;
  locationName: string;
  returnDate: string;
  total: number;
  createdAt: string;
}

export interface ReturnInvoiceListPage {
  items: ReturnInvoiceListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ReturnInvoiceLine {
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

export interface ReturnInvoice {
  id: string;
  returnNumber: string | null;
  status: ReturnInvoiceStatus;
  supplierId: string;
  supplier?: { id: string; name: string };
  locationId: string;
  location?: { id: string; name: string };
  purchaseInvoiceId: string | null;
  returnDate: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes: string | null;
  lines: ReturnInvoiceLine[];
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
}
