import { backendFetch } from '@/core/api/backend-fetch-client';

export interface TrialBalanceRow {
  accountId: string;
  code: string;
  name: string;
  type: string;
  totalDebit: number;
  totalCredit: number;
  debitBalance: number;
  creditBalance: number;
}

export interface TrialBalance {
  rows: TrialBalanceRow[];
  totalDebit: number;
  totalCredit: number;
}

export interface GeneralLedgerLine {
  journalEntryId: string;
  entryNumber: string | null;
  entryDate: string;
  memo: string | null;
  description: string | null;
  debit: number;
  credit: number;
  runningBalance: number;
}

export interface GeneralLedger {
  account: { id: string; code: string; name: string; type: string };
  lines: GeneralLedgerLine[];
}

export interface AccountBalanceRow {
  accountId: string;
  code: string;
  name: string;
  balance: number;
}

export interface IncomeStatement {
  revenue: AccountBalanceRow[];
  expense: AccountBalanceRow[];
  totalRevenue: number;
  totalExpense: number;
  netIncome: number;
}

export interface BalanceSheet {
  assets: AccountBalanceRow[];
  liabilities: AccountBalanceRow[];
  equity: AccountBalanceRow[];
  netIncome: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
}

export const financialReportsApi = {
  trialBalance: (asOf?: string) => backendFetch<TrialBalance>('financial-reports/trial-balance', { searchParams: { asOf } }),
  generalLedger: (accountId: string, dateFrom?: string, dateTo?: string) =>
    backendFetch<GeneralLedger>('financial-reports/general-ledger', { searchParams: { accountId, dateFrom, dateTo } }),
  incomeStatement: (dateFrom?: string, dateTo?: string) =>
    backendFetch<IncomeStatement>('financial-reports/income-statement', { searchParams: { dateFrom, dateTo } }),
  balanceSheet: (asOf?: string) => backendFetch<BalanceSheet>('financial-reports/balance-sheet', { searchParams: { asOf } }),
};
