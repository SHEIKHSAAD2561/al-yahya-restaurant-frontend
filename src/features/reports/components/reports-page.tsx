'use client';

import { useState } from 'react';
import { AlertTriangle, Download, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { QueryErrorState } from '@/components/ui/query-error-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { toCsvRow } from '@/lib/csv';
import { downloadBlob } from '@/lib/download-blob';
import { BarChart } from '@/components/charts/bar-chart';
import { DonutChart, DONUT_COLORS } from '@/components/charts/donut-chart';
import { HorizontalBarChart } from '@/components/charts/horizontal-bar-chart';
import { useLocationsQuery } from '@/features/locations/hooks/use-locations-query';
import { useReportQuery } from '../hooks/use-report-query';
import { REPORT_PERIODS, type ReportPeriod } from '../types/report';

const ALL = 'ALL';

function formatCurrency(value: number): string {
  return `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`;
}
function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function ReportsPage() {
  const t = useTranslations('reports');
  const tCommon = useTranslations('common');
  const locationsQuery = useLocationsQuery();
  const [days, setDays] = useState<ReportPeriod>(30);
  const [locationId, setLocationId] = useState(ALL);

  const reportQuery = useReportQuery({ days, locationId: locationId === ALL ? undefined : locationId });

  function exportBestSelling() {
    if (!reportQuery.data) return;
    const header = ['#', t('product'), t('qtySold'), t('revenue'), t('profit')];
    const rows = reportQuery.data.bestSellingProducts.map((product, index) => [
      String(index + 1),
      product.name,
      product.qtySold.toString(),
      product.revenue.toFixed(2),
      product.profit.toFixed(2),
    ]);
    const csv = '﻿' + [header, ...rows].map(toCsvRow).join('\r\n');
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), 'best-selling-products.csv');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg bg-zinc-100 p-1">
          {REPORT_PERIODS.map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setDays(period)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                days === period ? 'bg-brand text-brand-foreground' : 'text-zinc-600 hover:text-zinc-900',
              )}
            >
              {t('daysCount', { count: period })}
            </button>
          ))}
        </div>
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

      {reportQuery.isPending ? (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : reportQuery.isError || !reportQuery.data ? (
        <QueryErrorState onRetry={() => void reportQuery.refetch()} />
      ) : (
        (() => {
          const report = reportQuery.data;
          return (
            <>
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {[
                  { label: t('revenue'), value: formatCurrency(report.stats.revenue) },
                  { label: t('grossProfit'), value: formatCurrency(report.stats.grossProfit) },
                  { label: t('profitMargin'), value: `${report.stats.profitMargin.toFixed(1)}%` },
                  { label: t('vat'), value: formatCurrency(report.stats.vat) },
                  { label: t('invoices'), value: report.stats.invoiceCount.toString() },
                  { label: t('averageInvoice'), value: formatCurrency(report.stats.averageInvoice) },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-zinc-200 bg-white p-4">
                    <p className="text-lg font-semibold text-zinc-900">{stat.value}</p>
                    <p className="mt-1 text-xs text-zinc-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <h3 className="mb-4 text-sm font-semibold text-zinc-900">{t('salesVsProfit')}</h3>
                <div className="mb-3 flex gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: 'var(--brand)' }} />
                    {t('sales')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-zinc-300" />
                    {t('profit')}
                  </span>
                </div>
                <BarChart
                  points={report.salesVsProfit.map((point) => ({
                    label: formatShortDate(point.date),
                    values: [point.sales, point.profit],
                  }))}
                  series={[
                    { label: t('sales'), color: 'var(--brand)' },
                    { label: t('profit'), color: '#d4d4d8' },
                  ]}
                  formatValue={(value) => value.toFixed(0)}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                  <h3 className="mb-4 text-sm font-semibold text-zinc-900">{t('salesByCategory')}</h3>
                  {report.salesByCategory.length === 0 ? (
                    <EmptyState icon={Package} title={tCommon('noResults')} />
                  ) : (
                    <div className="flex items-center gap-6">
                      <DonutChart slices={report.salesByCategory.map((row) => ({ label: row.name, value: row.total }))} />
                      <div className="space-y-1.5 text-sm">
                        {report.salesByCategory.map((row, index) => (
                          <div key={row.name} className="flex items-center gap-2">
                            <span
                              className="size-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
                            />
                            <span className="text-zinc-600">{row.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                  <h3 className="mb-4 text-sm font-semibold text-zinc-900">{t('salesByPaymentMethod')}</h3>
                  <HorizontalBarChart
                    bars={report.salesByPaymentMethod.map((row) => ({ label: row.name, value: row.total }))}
                    formatValue={formatCurrency}
                  />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                  <h3 className="mb-4 text-sm font-semibold text-zinc-900">{t('branchSales')}</h3>
                  <HorizontalBarChart
                    bars={report.branchSales.map((row) => ({ label: row.name, value: row.total }))}
                    formatValue={formatCurrency}
                  />
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                  <h3 className="mb-4 text-sm font-semibold text-zinc-900">{t('profitExpensesSummary')}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-zinc-600">
                      <span>{t('grossProfitFromSales')}</span>
                      <span className="font-medium text-emerald-600">{formatCurrency(report.profitExpensesSummary.grossProfit)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>{t('totalExpenses')}</span>
                      <span className="font-medium text-red-600">
                        - {formatCurrency(report.profitExpensesSummary.totalExpenses)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-100 pt-2 text-base font-semibold text-zinc-900">
                      <span>{t('netIncome')}</span>
                      <span className={report.profitExpensesSummary.netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                        {formatCurrency(report.profitExpensesSummary.netIncome)}
                      </span>
                    </div>
                    {Object.entries(report.profitExpensesSummary.expensesByCategory).length > 0 && (
                      <div className="space-y-1 border-t border-zinc-100 pt-2">
                        {Object.entries(report.profitExpensesSummary.expensesByCategory).map(([category, amount]) => (
                          <div key={category} className="flex justify-between text-xs text-zinc-500">
                            <span>{t(`expenseCategories.${category}`)}</span>
                            <span>{formatCurrency(amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900">{t('bestSellingProducts')}</h3>
                  <Button variant="outline" size="sm" onClick={exportBestSelling} disabled={report.bestSellingProducts.length === 0}>
                    <Download className="size-4" />
                    {t('exportCsv')}
                  </Button>
                </div>
                <Table>
                  <TableHead>
                    <tr>
                      <TableHeaderCell>#</TableHeaderCell>
                      <TableHeaderCell>{t('product')}</TableHeaderCell>
                      <TableHeaderCell>{t('qtySold')}</TableHeaderCell>
                      <TableHeaderCell>{t('revenue')}</TableHeaderCell>
                      <TableHeaderCell>{t('profit')}</TableHeaderCell>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {report.bestSellingProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="p-0">
                          <EmptyState icon={Package} title={tCommon('noResults')} />
                        </TableCell>
                      </TableRow>
                    ) : (
                      report.bestSellingProducts.map((product, index) => (
                        <TableRow key={product.name}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium text-zinc-900">{product.name}</TableCell>
                          <TableCell>{product.qtySold}</TableCell>
                          <TableCell>{formatCurrency(product.revenue)}</TableCell>
                          <TableCell className="text-emerald-600">{formatCurrency(product.profit)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    <Package className="size-4 text-brand" />
                    {t('inventoryValuation')}
                  </h3>
                  <p className="text-2xl font-semibold text-zinc-900">{formatCurrency(report.inventoryValuation)}</p>
                  <p className="mt-1 text-xs text-zinc-400">{t('inventoryValuationHint')}</p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                  <h3 className="mb-3 flex items-center justify-between text-sm font-semibold text-zinc-900">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="size-4 text-amber-500" />
                      {t('itemsBelowMinimum')}
                    </span>
                    <Badge variant="warning">{report.itemsBelowMinimum.length}</Badge>
                  </h3>
                  {report.itemsBelowMinimum.length === 0 ? (
                    <p className="text-sm text-zinc-400">{t('noLowStockItems')}</p>
                  ) : (
                    <div className="max-h-48 space-y-2 overflow-y-auto text-sm">
                      {report.itemsBelowMinimum.map((item, index) => (
                        <div key={`${item.sku}-${index}`} className="flex items-center justify-between">
                          <span className="text-zinc-700">{item.name}</span>
                          <Badge variant="danger">
                            {item.quantity} / {item.reorderPoint}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          );
        })()
      )}
    </div>
  );
}
