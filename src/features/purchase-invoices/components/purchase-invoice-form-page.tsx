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
  useConfirmPurchaseInvoiceMutation,
  useSavePurchaseInvoiceMutation,
} from '../hooks/use-save-purchase-invoice-mutation';
import { PURCHASE_INVOICE_STATUSES, type PurchaseInvoice } from '../types/purchase-invoice';
import type { PurchaseInvoiceLineInput } from '../api/purchase-invoices.api';

const NO_TAX = '__none__';

interface DraftLine extends PurchaseInvoiceLineInput {
  key: string;
  productName: string;
  sku: string;
}

interface PurchaseInvoiceFormPageProps {
  invoice?: PurchaseInvoice;
}

export function PurchaseInvoiceFormPage({ invoice }: PurchaseInvoiceFormPageProps) {
  const t = useTranslations('purchaseInvoices');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const locationsQuery = useLocationsQuery();
  const suppliersQuery = useSuppliersQuery();
  const taxesQuery = useTaxesQuery();
  const saveMutation = useSavePurchaseInvoiceMutation(invoice?.id);
  const confirmMutation = useConfirmPurchaseInvoiceMutation();

  const [supplierId, setSupplierId] = useState(invoice?.supplierId ?? '');
  const [locationId, setLocationId] = useState(invoice?.locationId ?? '');
  const [invoiceDate, setInvoiceDate] = useState(invoice?.invoiceDate ?? new Date().toISOString().slice(0, 10));
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

  const isEditable = !invoice || invoice.status === PURCHASE_INVOICE_STATUSES.DRAFT;
  const taxesById = new Map((taxesQuery.data ?? []).map((tax) => [tax.id, tax]));

  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitCost, 0);
  const taxTotal = lines.reduce((sum, line) => {
    const tax = line.taxId ? taxesById.get(line.taxId) : undefined;
    const rate = tax ? tax.lines.reduce((s, l) => s + l.rate, 0) : 0;
    return sum + line.quantity * line.unitCost * (rate / 100);
  }, 0);
  const total = subtotal + taxTotal;

  const canSave = Boolean(supplierId) && Boolean(locationId) && Boolean(invoiceDate) && lines.length > 0;

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
      invoiceDate,
      notes: notes.trim() || undefined,
      lines: lines.map((line) => ({
        variantId: line.variantId,
        quantity: line.quantity,
        unitCost: line.unitCost,
        taxId: line.taxId,
      })),
    };
  }

  /**
   * `PATCH /purchase-invoices/:id` doesn't accept `status` at all (only
   * `POST .../confirm` transitions DRAFT → CONFIRMED, see the backend's
   * `UpdatePurchaseInvoiceDto`) — so editing an existing draft and creating
   * a brand-new invoice need two different request shapes for "save and
   * confirm": create() takes `status` directly, update() never does and
   * needs a separate confirm() call chained after it.
   */
  function handleSave(confirm: boolean) {
    if (invoice) {
      saveMutation.mutate(buildInput(), {
        onSuccess: () => {
          if (confirm) {
            confirmMutation.mutate(invoice.id, { onSuccess: () => router.push('/purchase-invoices') });
          } else {
            router.push('/purchase-invoices');
          }
        },
      });
    } else {
      saveMutation.mutate(
        { ...buildInput(), status: confirm ? PURCHASE_INVOICE_STATUSES.CONFIRMED : PURCHASE_INVOICE_STATUSES.DRAFT },
        { onSuccess: () => router.push('/purchase-invoices') },
      );
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/purchase-invoices" aria-label={t('back')} className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100">
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </Link>
        <h1 className="text-lg font-semibold text-zinc-900">
          {invoice ? (invoice.invoiceNumber ?? t('editDraft')) : t('newPurchaseInvoice')}
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
            <Label htmlFor="invoiceDate">{t('invoiceDate')}</Label>
            <Input id="invoiceDate" type="date" value={invoiceDate} onChange={(event) => setInvoiceDate(event.target.value)} />
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
                          <SelectValue>
                            {line.taxId ? taxesById.get(line.taxId)?.name : t('noTax')}
                          </SelectValue>
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
          <Button type="button" variant="ghost" onClick={() => router.push('/purchase-invoices')}>
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
