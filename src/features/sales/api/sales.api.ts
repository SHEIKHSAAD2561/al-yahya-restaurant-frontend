import { backendDownload, backendFetch } from '@/core/api/backend-fetch-client';
import type { ParkedSaleSummary, Sale, SaleListPage, DiscountType, SellAt } from '../types/sale';

export interface CartLineInput {
  variantId: string;
  quantity: number;
  unitPriceOverride?: number;
}

export interface ParkSaleInput {
  id?: string;
  registerId: string;
  customerId?: string;
  sellAt: SellAt;
  discountType?: DiscountType;
  discountValue?: number;
  note?: string;
  lines: CartLineInput[];
}

export interface CheckoutSaleInput extends ParkSaleInput {
  /** "Pay Later" — bills the sale to `customerId` instead of collecting
   * payment now (`pos.checkout_post_payment`). `paymentMethodId`/
   * `amountTendered` are omitted in that case. */
  isPostPayment?: boolean;
  paymentMethodId?: string;
  amountTendered?: number;
  resumedFromSaleId?: string;
}

export interface SalesQuery {
  dateFrom?: string;
  dateTo?: string;
  invoiceNumber?: string;
  paymentMethodId?: string;
  locationId?: string;
  /** Cash Management's "Session Invoices" — every sale from one register session. */
  registerSessionId?: string;
  /** The Sale Invoices page's "Sale Type" filter (Retail/Wholesale) — the only
   * sale-type distinction that actually exists; there's no channel/delivery
   * partner concept in this schema yet, so those filters aren't offered. */
  sellAt?: SellAt;
  customerSearch?: string;
  productName?: string;
  productSku?: string;
  page?: number;
  pageSize?: number;
}

export const salesApi = {
  park: (input: ParkSaleInput) => backendFetch<Sale>('sales/park', { method: 'POST', body: input }),
  checkout: (input: CheckoutSaleInput) => backendFetch<Sale>('sales/checkout', { method: 'POST', body: input }),
  listParked: (registerId: string) =>
    backendFetch<ParkedSaleSummary[]>('sales/parked', { searchParams: { registerId } }),
  getParkedDetail: (id: string) => backendFetch<Sale>(`sales/parked/${id}`),
  discardParked: (id: string) => backendFetch<void>(`sales/parked/${id}`, { method: 'DELETE' }),
  list: (query: SalesQuery = {}) =>
    backendFetch<SaleListPage>('sales', {
      searchParams: {
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
        invoiceNumber: query.invoiceNumber || undefined,
        paymentMethodId: query.paymentMethodId,
        locationId: query.locationId,
        registerSessionId: query.registerSessionId,
        sellAt: query.sellAt,
        customerSearch: query.customerSearch || undefined,
        productName: query.productName || undefined,
        productSku: query.productSku || undefined,
        page: query.page?.toString(),
        pageSize: query.pageSize?.toString(),
      },
    }),
  get: (id: string) => backendFetch<Sale>(`sales/${id}`),
  exportCsv: (query: SalesQuery = {}) =>
    backendDownload('sales/export', {
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      invoiceNumber: query.invoiceNumber || undefined,
      paymentMethodId: query.paymentMethodId,
      locationId: query.locationId,
      sellAt: query.sellAt,
      customerSearch: query.customerSearch || undefined,
    }),
};
