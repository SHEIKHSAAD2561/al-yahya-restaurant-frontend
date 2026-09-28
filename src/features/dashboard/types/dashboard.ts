export interface DashboardFinancials {
  salesThisMonth: number;
  salesTrend: number | null;
  transactionsThisMonth: number;
  transactionsTrend: number | null;
  grossProfitThisMonth: number;
  grossProfitTrend: number | null;
  inventoryValueToday: number;
  amountsCollected: {
    byMethod: { name: string; total: number }[];
    total: number;
  };
}

export interface NamedTotal {
  name: string;
  total: number;
}

export interface DashboardSalesBreakdown {
  period: { date: string; total: number }[];
  products: NamedTotal[];
  categories: NamedTotal[];
  branches: NamedTotal[];
  cashiers: NamedTotal[];
}

export interface DashboardLatestSale {
  id: string;
  invoiceNumber: string | null;
  customerName: string | null;
  completedAt: string | null;
  total: number;
}

export interface DashboardActivityEvent {
  type: 'sale' | 'expense';
  id: string;
  label: string;
  sublabel: string;
  amount: number;
  at: string;
}

export interface DashboardCashRegister {
  id: string;
  name: string;
  openingAmount: number;
  status: 'OPEN' | 'CLOSED';
}

export interface DashboardSummary {
  financials: DashboardFinancials | null;
  salesBreakdown: DashboardSalesBreakdown | null;
  latestSales: DashboardLatestSale[] | null;
  activityLog: DashboardActivityEvent[] | null;
  cashRegisters: DashboardCashRegister[] | null;
}
