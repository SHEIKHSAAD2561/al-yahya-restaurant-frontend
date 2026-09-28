'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { TrialBalanceTab } from './trial-balance-tab';
import { GeneralLedgerTab } from './general-ledger-tab';
import { IncomeStatementTab } from './income-statement-tab';
import { BalanceSheetTab } from './balance-sheet-tab';

const TABS = ['trialBalance', 'generalLedger', 'incomeStatement', 'balanceSheet'] as const;
type Tab = (typeof TABS)[number];

export function FinancialReportsPage() {
  const t = useTranslations('financialReports');
  const [tab, setTab] = useState<Tab>('trialBalance');

  return (
    <div className="space-y-4">
      <div className="border-b border-zinc-200">
        <nav className="-mb-px flex gap-6 overflow-x-auto">
          {TABS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                'whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors',
                tab === value ? 'border-brand text-brand' : 'border-transparent text-zinc-500 hover:text-zinc-800',
              )}
            >
              {t(`tabs.${value}`)}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'trialBalance' && <TrialBalanceTab />}
      {tab === 'generalLedger' && <GeneralLedgerTab />}
      {tab === 'incomeStatement' && <IncomeStatementTab />}
      {tab === 'balanceSheet' && <BalanceSheetTab />}
    </div>
  );
}
