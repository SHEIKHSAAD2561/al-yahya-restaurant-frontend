export interface CustomerPaymentListItem {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethodName: string | null;
  paymentDate: string;
  notes: string | null;
}

export interface CustomerPaymentListPage {
  items: CustomerPaymentListItem[];
  total: number;
  page: number;
  pageSize: number;
}
