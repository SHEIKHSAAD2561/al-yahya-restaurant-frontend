'use client';

import { useState } from 'react';
import { Pencil, Percent, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { TablePagination } from '@/components/ui/table-pagination';
import { Link } from '@/core/i18n/navigation';
import { useTaxesQuery } from '../hooks/use-taxes-query';
import { ToggleTaxStatusDialog } from './toggle-tax-status-dialog';
import { TAX_TYPES } from '../types/tax-type';
import type { Tax } from '../types/tax';

function formatRate(tax: Tax): string {
  const parts = tax.lines
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((line) => `${line.rate.toFixed(2)}%`);

  if (tax.hasCompoundTax && tax.compoundRate !== null) {
    parts.push(`${tax.compoundRate.toFixed(2)}%`);
  }

  return parts.join(' + ');
}

export function TaxesPage() {
  const t = useTranslations('settings.taxes');
  const tCommon = useTranslations('common');
  const taxesQuery = useTaxesQuery();

  const [pageSize, setPageSize] = useState('10');
  const [page, setPage] = useState(0);
  const [dialogTax, setDialogTax] = useState<Tax | null>(null);

  const taxes = taxesQuery.data ?? [];
  const size = Number(pageSize);
  const pageCount = Math.max(1, Math.ceil(taxes.length / size));
  const currentPage = Math.min(page, pageCount - 1);
  const pageTaxes = taxes.slice(currentPage * size, currentPage * size + size);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">{t('title')}</h1>
        <Button asChild>
          <Link href="/settings/taxes/new">
            <Plus className="size-4" />
            {t('addTax')}
          </Link>
        </Button>
      </div>

      {taxesQuery.isPending ? (
        <Table>
          <TableBody>
            {Array.from({ length: 3 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell colSpan={4}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : taxes.length === 0 ? (
        <Table>
          <TableBody>
            <TableRow>
              <TableCell colSpan={4} className="p-0">
                <EmptyState icon={Percent} title={tCommon('noResults')} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      ) : (
        <>
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>{t('taxName')}</TableHeaderCell>
                <TableHeaderCell>{t('taxRate')}</TableHeaderCell>
                <TableHeaderCell>{t('taxCode')}</TableHeaderCell>
                <TableHeaderCell className="w-40" />
              </tr>
            </TableHead>
            <TableBody>
              {pageTaxes.map((tax) => (
                <TableRow key={tax.id}>
                  <TableCell>
                    <Link href={`/settings/taxes/${tax.id}`} className="font-medium text-brand hover:underline">
                      {tax.name}
                    </Link>
                  </TableCell>
                  <TableCell>{formatRate(tax)}</TableCell>
                  <TableCell>{tax.code}</TableCell>
                  <TableCell>
                    {tax.type === TAX_TYPES.CUSTOM ? (
                      <Link
                        href={`/settings/taxes/${tax.id}`}
                        className="inline-flex rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                        aria-label={tCommon('edit')}
                      >
                        <Pencil className="size-4" />
                      </Link>
                    ) : tax.type === TAX_TYPES.SYSTEM_LOCKED ? (
                      <button
                        type="button"
                        disabled
                        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-400"
                      >
                        ✓ {t('activated')}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDialogTax(tax)}
                        className="rounded-lg border border-brand px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand-muted"
                      >
                        {tax.isActive ? `✕ ${t('deactivate')}` : `✓ ${t('activate')}`}
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <TablePagination
            page={currentPage}
            pageCount={pageCount}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={(value) => {
              setPageSize(value);
              setPage(0);
            }}
            pageSizeLabel={t('noOfResults')}
          />
        </>
      )}

      <ToggleTaxStatusDialog tax={dialogTax} onOpenChange={(open) => !open && setDialogTax(null)} />
    </div>
  );
}
