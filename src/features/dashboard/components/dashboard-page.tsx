'use client';

import { useState } from 'react';
import {
  Banknote,
  Boxes,
  Expand,
  FileText,
  Lock,
  Receipt,
  ShoppingCart,
  Unlock,
  Wallet,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { QueryErrorState } from '@/components/ui/query-error-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/core/i18n/navigation';
import { usePermission, useDisplayName } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { useLocationsQuery } from '@/features/locations/hooks/use-locations-query';
import { useDashboardSummaryQuery } from '../hooks/use-dashboard-summary-query';
import { StatCard } from './stat-card';
import { SalesBreakdownCard } from './sales-breakdown-card';

const ALL = 'ALL';

function formatCurrency(value: number): string {
  return `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`;
}

export function DashboardPage() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const displayName = useDisplayName();
  const locationsQuery = useLocationsQuery();
  const [locationId, setLocationId] = useState(ALL);

  const canViewFinancials = usePermission(PERMISSIONS.DASHBOARD_VIEW_FINANCIAL_METRICS);
  const canViewBreakdowns = usePermission(PERMISSIONS.DASHBOARD_SALES_BREAKDOWNS);
  const canViewInsights = usePermission(PERMISSIONS.DASHBOARD_SALES_INSIGHTS);
  const canViewRegisters = usePermission(PERMISSIONS.DASHBOARD_VIEW_REGISTER_INSIGHTS);

  const summaryQuery = useDashboardSummaryQuery(locationId === ALL ? undefined : locationId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-zinc-900">{t('welcomeBack', { name: displayName })}</h1>
        {(locationsQuery.data?.length ?? 0) > 1 && (
          <Select value={locationId} onValueChange={setLocationId}>
            <SelectTrigger className="w-48">
              <SelectValue>
                {locationId === ALL ? t('allBranches') : locationsQuery.data?.find((l) => l.id === locationId)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('allBranches')}</SelectItem>
              {(locationsQuery.data ?? []).map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {summaryQuery.isPending ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : summaryQuery.isError || !summaryQuery.data ? (
        <QueryErrorState onRetry={() => void summaryQuery.refetch()} />
      ) : (
        (() => {
          const summary = summaryQuery.data;
          return (
            <>
              {canViewFinancials && summary.financials && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard
                    icon={ShoppingCart}
                    value={formatCurrency(summary.financials.salesThisMonth)}
                    label={t('salesThisMonth')}
                    trend={summary.financials.salesTrend}
                  />
                  <StatCard
                    icon={FileText}
                    value={summary.financials.transactionsThisMonth.toString()}
                    label={t('transactionsThisMonth')}
                    trend={summary.financials.transactionsTrend}
                  />
                  <StatCard
                    icon={Wallet}
                    value={formatCurrency(summary.financials.grossProfitThisMonth)}
                    label={t('grossProfitThisMonth')}
                    trend={summary.financials.grossProfitTrend}
                  />
                </div>
              )}

              <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
                {canViewBreakdowns && summary.salesBreakdown && <SalesBreakdownCard breakdown={summary.salesBreakdown} />}

                <div className="space-y-4">
                  {canViewFinancials && summary.financials && (
                    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                        <Boxes className="size-4 text-brand" />
                        {t('inventoryValueToday')}
                      </div>
                      <p className="mt-3 text-2xl font-semibold text-zinc-900">
                        {formatCurrency(summary.financials.inventoryValueToday)}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">{t('atCost')}</p>
                    </div>
                  )}

                  {canViewFinancials && summary.financials && (
                    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                      <h3 className="mb-3 text-sm font-semibold text-zinc-900">{t('amountsCollected')}</h3>
                      <div className="space-y-2 text-sm">
                        {summary.financials.amountsCollected.byMethod.length === 0 ? (
                          <p className="text-zinc-400">{tCommon('noResults')}</p>
                        ) : (
                          summary.financials.amountsCollected.byMethod.map((row) => (
                            <div key={row.name} className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-zinc-600">
                                <Banknote className="size-3.5 text-zinc-400" />
                                {row.name}
                              </span>
                              <span className="font-medium text-zinc-900">{formatCurrency(row.total)}</span>
                            </div>
                          ))
                        )}
                        <div className="flex items-center justify-between border-t border-zinc-100 pt-2 text-sm font-semibold text-zinc-900">
                          <span>{t('total')}</span>
                          <span>{formatCurrency(summary.financials.amountsCollected.total)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {canViewInsights && summary.latestSales && summary.activityLog && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-zinc-900">{t('latestSales')}</h3>
                      <Link href="/sale-invoices" className="text-xs font-medium text-brand hover:underline">
                        {t('viewAll')}
                      </Link>
                    </div>
                    {summary.latestSales.length === 0 ? (
                      <EmptyState icon={Receipt} title={tCommon('noResults')} />
                    ) : (
                      <div className="space-y-3">
                        {summary.latestSales.map((sale) => (
                          <div key={sale.id} className="flex items-center justify-between text-sm">
                            <div>
                              <p className="font-medium text-zinc-900">{sale.invoiceNumber}</p>
                              <p className="text-xs text-zinc-500">
                                {sale.customerName ?? t('walkInCustomer')} ·{' '}
                                {sale.completedAt ? new Date(sale.completedAt).toLocaleString() : ''}
                              </p>
                            </div>
                            <span className="font-medium text-zinc-900">{formatCurrency(sale.total)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                    <h3 className="mb-3 text-sm font-semibold text-zinc-900">{t('activityLog')}</h3>
                    {summary.activityLog.length === 0 ? (
                      <EmptyState icon={Receipt} title={tCommon('noResults')} />
                    ) : (
                      <div className="space-y-3">
                        {summary.activityLog.map((event) => (
                          <div key={`${event.type}-${event.id}`} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="flex size-7 items-center justify-center rounded-full bg-brand-muted text-brand">
                                {event.type === 'sale' ? (
                                  <ShoppingCart className="size-3.5" />
                                ) : (
                                  <Receipt className="size-3.5" />
                                )}
                              </span>
                              <div>
                                <p className="font-medium text-zinc-900">{event.label}</p>
                                <p className="text-xs text-zinc-500">{event.sublabel}</p>
                              </div>
                            </div>
                            <span className="text-xs text-zinc-400">{new Date(event.at).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {canViewRegisters && summary.cashRegisters && summary.cashRegisters.length > 0 && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                  <h3 className="mb-3 text-sm font-semibold text-zinc-900">{t('cashRegisters')}</h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {summary.cashRegisters.map((register) => (
                      <div
                        key={register.id}
                        className="flex items-center justify-between rounded-xl border border-zinc-200 p-4"
                      >
                        <div>
                          <p className="text-sm font-medium text-zinc-900">{register.name}</p>
                          <p className="text-xs text-zinc-500">
                            {t('opening')}: {formatCurrency(register.openingAmount)}
                          </p>
                        </div>
                        <Badge variant={register.status === 'OPEN' ? 'success' : 'neutral'}>
                          {register.status === 'OPEN' ? <Unlock className="size-3" /> : <Lock className="size-3" />}
                          {t(register.status === 'OPEN' ? 'open' : 'closed')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!canViewFinancials && !canViewBreakdowns && !canViewInsights && !canViewRegisters && (
                <EmptyState icon={Expand} title={t('noWidgetsPermission')} />
              )}
            </>
          );
        })()
      )}
    </div>
  );
}
