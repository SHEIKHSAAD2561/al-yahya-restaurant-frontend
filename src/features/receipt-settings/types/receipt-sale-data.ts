/** The subset of a real `Sale` (or a dummy preview sale) that `ReceiptDocument`
 * needs to render — decoupled from `features/sales`' own `Sale` type so the
 * preview can synthesize one without a real transaction. */
export interface ReceiptSaleLine {
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ReceiptSaleData {
  invoiceNumber: string | null;
  createdAt: string;
  cashierName: string | null;
  customerName: string | null;
  paymentMethodName: string | null;
  lines: ReceiptSaleLine[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  amountPaid: number | null;
  changeDue: number | null;
}

interface CheckoutReceiptInputs {
  invoiceNumber: string | null;
  completedAt: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  amountPaid: number | null;
}

interface CheckoutReceiptLine {
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
}

/**
 * Builds the Pay dialog's post-checkout print data straight from what the
 * cashier already has in hand (the checkout response, the cart lines, the
 * chosen payment method's name, their own display name) rather than
 * re-fetching `GET /sales/:id` — that route needs `pos.view_sale_invoices`
 * or `pos.manage_cash`, permissions an ordinary cashier printing their own
 * just-completed sale shouldn't need.
 */
export function checkoutToReceiptData(
  sale: CheckoutReceiptInputs,
  lines: CheckoutReceiptLine[],
  paymentMethodName: string,
  cashierName: string,
  customerName: string | null,
  amountTendered: number,
): ReceiptSaleData {
  return {
    invoiceNumber: sale.invoiceNumber,
    createdAt: sale.completedAt ?? new Date().toISOString(),
    cashierName,
    customerName,
    paymentMethodName,
    lines: lines.map((line) => ({
      productName: line.name,
      sku: line.sku,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      lineTotal: line.unitPrice * line.quantity,
    })),
    subtotal: sale.subtotal,
    discountAmount: sale.discountAmount,
    taxAmount: sale.taxAmount,
    total: sale.total,
    amountPaid: sale.amountPaid,
    changeDue: sale.amountPaid !== null ? Math.max(0, amountTendered - sale.total) : null,
  };
}

interface DetailReceiptInputs {
  invoiceNumber: string | null;
  createdAt: string;
  cashierName?: string;
  customerName?: string | null;
  paymentMethodName?: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  amountPaid: number | null;
  amountTendered: number | null;
  lines: { productName: string; sku: string; quantity: number; unitPrice: number; lineTotal: number }[];
}

/** Builds receipt data from a real, already-fetched `GET /sales/:id` response
 * (the Invoice List / Invoice Details print action) — unlike
 * `checkoutToReceiptData`, every field here comes straight off the sale
 * record itself, no cart/session lookups needed. */
export function saleDetailToReceiptData(sale: DetailReceiptInputs): ReceiptSaleData {
  return {
    invoiceNumber: sale.invoiceNumber,
    createdAt: sale.createdAt,
    cashierName: sale.cashierName ?? null,
    customerName: sale.customerName ?? null,
    paymentMethodName: sale.paymentMethodName ?? null,
    lines: sale.lines,
    subtotal: sale.subtotal,
    discountAmount: sale.discountAmount,
    taxAmount: sale.taxAmount,
    total: sale.total,
    amountPaid: sale.amountPaid,
    changeDue:
      sale.amountPaid !== null && sale.amountTendered !== null
        ? Math.max(0, sale.amountTendered - sale.total)
        : null,
  };
}

/** A stand-in sale for the settings page's live preview — clearly placeholder
 * content (Item 1/Item 2), never real transaction data. */
export function dummyReceiptSaleData(): ReceiptSaleData {
  const lines: ReceiptSaleLine[] = [
    { productName: 'Item 1', sku: 'SKU-001', quantity: 2, unitPrice: 15, lineTotal: 30 },
    { productName: 'Item 2', sku: 'SKU-002', quantity: 1, unitPrice: 25, lineTotal: 25 },
  ];
  const subtotal = 55;
  const taxAmount = 8.25;
  const total = subtotal + taxAmount;
  return {
    invoiceNumber: 'S20260101-1',
    createdAt: new Date().toISOString(),
    cashierName: 'Cashier Name',
    customerName: 'Walk-in Customer',
    paymentMethodName: 'Cash',
    lines,
    subtotal,
    discountAmount: 0,
    taxAmount,
    total,
    amountPaid: total,
    changeDue: 0,
  };
}
