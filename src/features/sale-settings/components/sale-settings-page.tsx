'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ComingSoon } from '@/components/layout/coming-soon';
import { QueryErrorState } from '@/components/ui/query-error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ReceiptsTab } from '@/features/receipt-settings/components/receipts-tab';
import { useReceiptSettingsQuery } from '@/features/receipt-settings/hooks/use-receipt-settings-query';
import { useSaleSettingsQuery } from '../hooks/use-sale-settings-query';
import { SalesTab } from './sales-tab';

const TABS = ['sales', 'receipts', 'sellingScreen', 'ecommerceOrders'] as const;
type Tab = (typeof TABS)[number];

export function SaleSettingsPage() {
  const t = useTranslations('saleSettings');
  const tNav = useTranslations('nav');
  const [tab, setTab] = useState<Tab>('sales');
  const saleSettingsQuery = useSaleSettingsQuery();
  const receiptSettingsQuery = useReceiptSettingsQuery();

  return (
    <div className="space-y-4">
      <div className="border-b border-zinc-200">
        <nav className="-mb-px flex gap-6">
          {TABS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                'border-b-2 px-1 pb-3 text-sm font-medium transition-colors',
                tab === value ? 'border-brand text-brand' : 'border-transparent text-zinc-500 hover:text-zinc-800',
              )}
            >
              {t(`tabs.${value}`)}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'sales' &&
        (saleSettingsQuery.isPending ? (
          <Skeleton className="h-64 w-full" />
        ) : saleSettingsQuery.isError || !saleSettingsQuery.data ? (
          <QueryErrorState onRetry={() => void saleSettingsQuery.refetch()} />
        ) : (
          <SalesTab key={saleSettingsQuery.data.updatedAt} settings={saleSettingsQuery.data} />
        ))}

      {tab === 'receipts' &&
        (receiptSettingsQuery.isPending ? (
          <Skeleton className="h-64 w-full" />
        ) : receiptSettingsQuery.isError || !receiptSettingsQuery.data ? (
          <QueryErrorState onRetry={() => void receiptSettingsQuery.refetch()} />
        ) : (
          <ReceiptsTab key={receiptSettingsQuery.data.updatedAt} settings={receiptSettingsQuery.data} />
        ))}

      {tab === 'sellingScreen' && <ComingSoon title={tNav('saleSettings')} />}
      {tab === 'ecommerceOrders' && <ComingSoon title={tNav('saleSettings')} />}
    </div>
  );
}
