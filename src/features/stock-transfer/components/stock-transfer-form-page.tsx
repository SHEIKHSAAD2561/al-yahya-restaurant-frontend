'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, Search, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { Link, useRouter } from '@/core/i18n/navigation';
import { useDebouncedValue } from '@/core/hooks/use-debounced-value';
import { useLocationsQuery } from '@/features/locations/hooks/use-locations-query';
import { useProductsQuery } from '@/features/products/hooks/use-products-query';
import { useCreateStockTransferMutation } from '../hooks/use-stock-transfer-mutations';
import type { StockTransferLineInput } from '../api/stock-transfers.api';

interface DraftLine extends StockTransferLineInput {
  key: string;
  productName: string;
  sku: string;
}

export function StockTransferFormPage() {
  const t = useTranslations('stockTransfer');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const locationsQuery = useLocationsQuery();
  const createMutation = useCreateStockTransferMutation();

  const [fromLocationId, setFromLocationId] = useState('');
  const [toLocationId, setToLocationId] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<DraftLine[]>([]);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());
  const productsQuery = useProductsQuery(
    { search: debouncedSearch, page: 1, pageSize: 10, excludeComposite: true },
    debouncedSearch.length > 0,
  );
  const searchResults = productsQuery.data?.items ?? [];

  const canSave =
    Boolean(fromLocationId) && Boolean(toLocationId) && fromLocationId !== toLocationId && lines.length > 0;

  function addLine(variantId: string, productName: string, sku: string) {
    if (lines.some((line) => line.variantId === variantId)) return;
    setLines((current) => [...current, { key: variantId, variantId, productName, sku, quantity: 1 }]);
    setSearch('');
  }

  function updateLine(key: string, patch: Partial<DraftLine>) {
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  }

  function removeLine(key: string) {
    setLines((current) => current.filter((line) => line.key !== key));
  }

  function handleCreate() {
    createMutation.mutate(
      {
        fromLocationId,
        toLocationId,
        notes: notes.trim() || undefined,
        lines: lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
      },
      { onSuccess: () => router.push('/stock-transfer') },
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/stock-transfer" aria-label={t('back')} className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100">
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </Link>
        <h1 className="text-lg font-semibold text-zinc-900">{t('newTransfer')}</h1>
      </div>

      <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{t('fromLocation')}</Label>
          <Select value={fromLocationId} onValueChange={setFromLocationId}>
            <SelectTrigger>
              <SelectValue>{locationsQuery.data?.find((l) => l.id === fromLocationId)?.name}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(locationsQuery.data ?? []).map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>{t('toLocation')}</Label>
          <Select value={toLocationId} onValueChange={setToLocationId}>
            <SelectTrigger>
              <SelectValue>{locationsQuery.data?.find((l) => l.id === toLocationId)?.name}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(locationsQuery.data ?? []).map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fromLocationId && toLocationId && fromLocationId === toLocationId && (
            <p className="text-xs text-red-600">{t('sameLocationError')}</p>
          )}
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="notes">{t('notes')}</Label>
          <Input id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-zinc-900">{t('lineItems')}</h2>
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('searchProducts')}
            className="ps-9"
            disabled={!fromLocationId}
          />
          {debouncedSearch && searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-md">
              {searchResults.map((item) => (
                <button
                  key={item.variantId}
                  type="button"
                  onClick={() => addLine(item.variantId, item.name, item.sku)}
                  className="flex w-full items-center justify-between px-3 py-2 text-start text-sm hover:bg-zinc-50"
                >
                  <span>
                    {item.name} <span className="text-zinc-400">({item.sku})</span>
                  </span>
                  <Plus className="size-4 text-zinc-400" />
                </button>
              ))}
            </div>
          )}
        </div>
        {!fromLocationId && <p className="text-xs text-zinc-400">{t('selectFromLocationFirst')}</p>}

        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>{t('product')}</TableHeaderCell>
              <TableHeaderCell>{t('quantity')}</TableHeaderCell>
              <TableHeaderCell className="w-10" />
            </tr>
          </TableHead>
          <TableBody>
            {lines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-zinc-400">
                  {t('noLinesYet')}
                </TableCell>
              </TableRow>
            ) : (
              lines.map((line) => (
                <TableRow key={line.key}>
                  <TableCell className="font-medium text-zinc-900">
                    {line.productName} <span className="text-zinc-400">({line.sku})</span>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0.001"
                      step="0.001"
                      value={line.quantity}
                      onChange={(event) => updateLine(line.key, { quantity: Number(event.target.value) })}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => removeLine(line.key)}
                      aria-label={tCommon('delete')}
                      className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.push('/stock-transfer')}>
          {tCommon('cancel')}
        </Button>
        <Button type="button" disabled={!canSave || createMutation.isPending} onClick={handleCreate}>
          {t('submitRequest')}
        </Button>
      </div>
    </div>
  );
}
