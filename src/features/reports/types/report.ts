export const REPORT_PERIODS = [7, 30, 90] as const;
export type ReportPeriod = (typeof REPORT_PERIODS)[number];

export interface ReportStats {
  revenue: number;
  grossProfit: number;
  profitMargin: number;
  vat: number;
  invoiceCount: number;
  averageInvoice: number;
}

export interface NamedTotal {
  name: string;
  total: number;
}

export interface ReportBestSellingProduct {
  name: string;
  qtySold: number;
  revenue: number;
  profit: number;
}

export interface ReportItemBelowMinimum {
  name: string;
  sku: string;
  quantity: number;
  reorderPoint: number;
}

export interface Report {
  days: ReportPeriod;
  stats: ReportStats;
  salesVsProfit: { date: string; sales: number; profit: number }[];
  salesByCategory: NamedTotal[];
  salesByPaymentMethod: NamedTotal[];
  branchSales: NamedTotal[];
  profitExpensesSummary: {
    grossProfit: number;
    totalExpenses: number;
    netIncome: number;
    expensesByCategory: Record<string, number>;
  };
  bestSellingProducts: ReportBestSellingProduct[];
  inventoryValuation: number;
  itemsBelowMinimum: ReportItemBelowMinimum[];
}
