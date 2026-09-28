'use client';

import { useQuery } from '@tanstack/react-query';
import { financialReportsApi } from '../api/financial-reports.api';

export function useTrialBalanceQuery(asOf?: string) {
  return useQuery({
    queryKey: ['financial-reports', 'trial-balance', asOf] as const,
    queryFn: () => financialReportsApi.trialBalance(asOf),
  });
}

export function useGeneralLedgerQuery(accountId: string, dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['financial-reports', 'general-ledger', accountId, dateFrom, dateTo] as const,
    queryFn: () => financialReportsApi.generalLedger(accountId, dateFrom, dateTo),
    enabled: Boolean(accountId),
  });
}

export function useIncomeStatementQuery(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['financial-reports', 'income-statement', dateFrom, dateTo] as const,
    queryFn: () => financialReportsApi.incomeStatement(dateFrom, dateTo),
  });
}

export function useBalanceSheetQuery(asOf?: string) {
  return useQuery({
    queryKey: ['financial-reports', 'balance-sheet', asOf] as const,
    queryFn: () => financialReportsApi.balanceSheet(asOf),
  });
}
