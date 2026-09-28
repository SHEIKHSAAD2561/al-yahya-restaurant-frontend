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
import { useSuppliersQuery } from '@/features/suppliers/hooks/use-suppliers-query';
import { useProductsQuery } from '@/features/products/hooks/use-products-query';
import { useTaxesQuery } from '@/features/taxes/hooks/use-taxes-query';
import {
  useConfirmReturnInvoiceMutation,
  useSaveReturnInvoiceMutation,
} from '../hooks/use-save-return-invoice-mutation';
import { RETURN_INVOICE_STATUSES, type ReturnInvoice } from '../types/return-invoice';
import type { ReturnInvoiceLineInput } from '../api/return-invoices.api';

const NO_TAX = '__none__';

interface DraftLine extends ReturnInvoiceLineInput {
  key: string;
  productName: string;
  sku: string;
}

export function ReturnInvoiceFormPage({ invoice }: { invoice?: ReturnInvoice }) {
  const t = useTranslations('returnInvoices');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const locationsQuery = useLocationsQuery();
  const suppliersQuery = useSuppliersQuery();
  const taxesQuery = useTaxesQuery();
  const saveMutation = useSaveReturnInvoiceMutation(invoice?.id);
  const confirmMutation = useConfirmReturnInvoiceMutation();

  const [supplierId, setSupplierId] = useState(invoice?.supplierId ?? '');
  const [locationId, setLocationId] = useState(invoice?.locationId ?? '');
  const [returnDate, setReturnDate] = useState(invoice?.returnDate ?? new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState(invoice?.notes ?? '');
  const [lines, setLines] = useState<DraftLine[]>(
    invoice?.lines.map((line) => ({
      key: line.id,
      variantId: line.variantId,
      productName: line.productName,
      sku: line.sku,
      quantity: line.quantity,
      unitCost: line.unitCost,
      taxId: line.taxId,
    })) ?? [],
  );

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());
  const productsQuery = useProductsQuery({ search: debouncedSearch, page: 1, pageSize: 10 }, debouncedSearch.length > 0);

  const isEditable = !invoice || invoice.status === RETURN_INVOICE_STATUSES.DRAFT;
  const taxesById = new Map((taxesQuery.data ?? []).map((tax) => [tax.id, tax]));

  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitCost, 0);
  const taxTotal = lines.reduce((sum, line) => {
    const tax = line.taxId ? taxesById.get(line.taxId) : undefined;
    const rate = tax ? tax.lines.reduce((s, l) => s + l.rate, 0) : 0;
    return sum + line.quantity * line.unitCost * (rate / 100);
  }, 0);
  const total = subtotal + taxTotal;
  const canSave = Boolean(supplierId) && Boolean(locationId) && Boolean(returnDate) && lines.length > 0;

  function addLine(variantId: string, productName: string, sku: string, cost: number) {
    if (lines.some((line) => line.variantId === variantId)) return;
    setLines((current) => [
      ...current,
      { key: variantId, variantId, productName, sku, quantity: 1, unitCost: cost, taxId: null },
    ]);
    setSearch('');
  }
  function updateLine(key: string, patch: Partial<DraftLine>) {
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  }
  function removeLine(key: string) {
    setLines((current) => current.filter((line) => line.key !== key));
  }

  function buildInput() {
    return {
      supplierId,
      locationId,
      returnDate,
      notes: notes.trim() || undefined,
      lines: lines.map((line) => ({
        variantId: line.variantId,
        quantity: line.quantity,
        unitCost: line.unitCost,
        taxId: line.taxId,
      })),
    };
  }

  function handleSave(confirm: boolean) {
    if (invoice) {
      saveMutation.mutate(buildInput(), {
        onSuccess: () => {
          if (confirm) {
            confirmMutation.mutate(invoice.id, { onSuccess: () => router.push('/return-invoices') });
          } else {
            router.push('/return-invoices');
          }
        },
      });
    } else {
      saveMutation.mutate(
        { ...buildInput(), status: confirm ? RETURN_INVOICE_STATUSES.CONFIRMED : RETURN_INVOICE_STATUSES.DRAFT },
        { onSuccess: () => router.push('/return-invoices') },
      );
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/return-invoices" aria-label={t('back')} className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100">
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </Link>
        <h1 className="text-lg font-semibold text-zinc-900">
          {invoice ? (invoice.returnNumber ?? t('editDraft')) : t('newReturnInvoice')}
        </h1>
      </div>

      <fieldset disabled={!isEditable} className="space-y-6 disabled:opacity-60">
        <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t('supplier')}</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger>
                <SelectValue>{suppliersQuery.data?.find((s) => s.id === supplierId)?.name}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(suppliersQuery.data ?? []).map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t('location')}</Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger>
                <SelectValue>{locationsQuery.data?.find((l) => l.id === locationId)?.name}</SelectValue>
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
            <Label htmlFor="returnDate">{t('returnDate')}</Label>
            <Input id="returnDate" type="date" value={returnDate} onChange={(event) => setReturnDate(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">{t('notes')}</Label>
            <Input id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-zinc-900">{t('lineItems')}</h2>
          {isEditable && (
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('searchProducts')} className="ps-9" />
              {debouncedSearch && (productsQuery.data?.items.length ?? 0) > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-md">
                  {productsQuery.data!.items.map((item) => (
                    <button
                      key={item.variantId}
                      type="button"
                      onClick={() => addLine(item.variantId, item.name, item.sku, item.cost ?? 0)}
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
          )}

          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>{t('product')}</TableHeaderCell>
                <TableHeaderCell>{t('quantity')}</TableHeaderCell>
                <TableHeaderCell>{t('unitCost')}</TableHeaderCell>
                <TableHeaderCell>{t('tax')}</TableHeaderCell>
                <TableHeaderCell>{t('lineTotal')}</TableHeaderCell>
                {isEditable && <TableHeaderCell className="w-10" />}
              </tr>
            </TableHead>
            <TableBody>
              {lines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-zinc-400">
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
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.unitCost}
                        onChange={(event) => updateLine(line.key, { unitCost: Number(event.target.value) })}
                        className="w-28"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={line.taxId ?? NO_TAX}
                        onValueChange={(value) => updateLine(line.key, { taxId: value === NO_TAX ? null : value })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue>{line.taxId ? taxesById.get(line.taxId)?.name : t('noTax')}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NO_TAX}>{t('noTax')}</SelectItem>
                          {(taxesQuery.data ?? []).map((tax) => (
                            <SelectItem key={tax.id} value={tax.id}>
                              {tax.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{(line.quantity * line.unitCost).toFixed(2)}</TableCell>
                    {isEditable && (
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
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="ms-auto max-w-xs space-y-1 text-sm">
            <div className="flex justify-between text-zinc-600">
              <span>{t('subtotal')}</span>
              <span>{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>{t('taxAmount')}</span>
              <span>{taxTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-100 pt-1 text-base font-semibold text-zinc-900">
              <span>{t('total')}</span>
              <span>{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </fieldset>

      {isEditable && (
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => router.push('/return-invoices')}>
            {tCommon('cancel')}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!canSave || saveMutation.isPending || confirmMutation.isPending}
            onClick={() => handleSave(false)}
          >
            {t('saveDraft')}
          </Button>
          <Button
            type="button"
            disabled={!canSave || saveMutation.isPending || confirmMutation.isPending}
            onClick={() => handleSave(true)}
          >
            {t('saveAndConfirm')}
          </Button>
        </div>
      )}
    </div>
  );
}
