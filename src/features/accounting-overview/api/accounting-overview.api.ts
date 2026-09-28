import { backendFetch } from '@/core/api/backend-fetch-client';

export interface AccountingSetupGuide {
  accounts: { total: number; active: number };
  journalEntries: { total: number; draft: number; posted: number };
  fixedAssets: { total: number; active: number };
  trialBalanceBalanced: boolean;
}

export const accountingOverviewApi = {
  getSetupGuide: () => backendFetch<AccountingSetupGuide>('accounting/setup-guide'),
};
