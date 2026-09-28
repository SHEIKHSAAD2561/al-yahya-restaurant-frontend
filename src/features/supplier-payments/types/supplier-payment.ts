export interface SupplierPaymentListItem {
  id: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  paymentMethodName: string | null;
  paymentDate: string;
  notes: string | null;
}

export interface SupplierPaymentListPage {
  items: SupplierPaymentListItem[];
  total: number;
  page: number;
  pageSize: number;
}
