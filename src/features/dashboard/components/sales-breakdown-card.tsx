'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { LineAreaChart } from '@/components/charts/line-area-chart';
import { HorizontalBarChart } from '@/components/charts/horizontal-bar-chart';
import type { DashboardSalesBreakdown } from '../types/dashboard';

const TABS = ['period', 'products', 'categories', 'branches', 'cashiers'] as const;
type Tab = (typeof TABS)[number];

function formatShortDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function SalesBreakdownCard({ breakdown }: { breakdown: DashboardSalesBreakdown }) {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const [tab, setTab] = useState<Tab>('period');

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-zinc-900">{t('salesBreakdown')}</h3>
        <div className="flex gap-1 rounded-lg bg-zinc-100 p-1">
          {TABS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                tab === value ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700',
              )}
            >
              {t(`breakdownTabs.${value}`)}
            </button>
          ))}
        </div>
      </div>

      {tab === 'period' ? (
        breakdown.period.length === 0 ? (
          <p className="flex h-[220px] items-center justify-center text-sm text-zinc-400">{tCommon('noResults')}</p>
        ) : (
          <LineAreaChart
            points={breakdown.period.map((point) => ({ label: formatShortDate(point.date), value: point.total }))}
            formatValue={(value) => value.toFixed(0)}
          />
        )
      ) : breakdown[tab].length === 0 ? (
        <p className="flex h-24 items-center justify-center text-sm text-zinc-400">{tCommon('noResults')}</p>
      ) : (
        <HorizontalBarChart
          bars={breakdown[tab].map((row) => ({ label: row.name, value: row.total }))}
          formatValue={(value) => value.toFixed(2)}
        />
      )}
    </div>
  );
}
