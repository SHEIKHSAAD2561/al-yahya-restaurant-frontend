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
import {
  useConfirmStockMovementMutation,
  useSaveStockMovementMutation,
} from '../hooks/use-save-stock-movement-mutation';
import { STOCK_MOVEMENT_STATUSES, STOCK_MOVEMENT_TYPES, type StockMovement, type StockMovementType } from '../types/stock-movement';
import type { StockMovementLineInput } from '../api/stock-movements.api';

interface DraftLine extends StockMovementLineInput {
  key: string;
  productName: string;
  sku: string;
}

interface StockMovementFormPageProps {
  movement?: StockMovement;
}

export function StockMovementFormPage({ movement }: StockMovementFormPageProps) {
  const t = useTranslations('stockOperations');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const locationsQuery = useLocationsQuery();
  const saveMutation = useSaveStockMovementMutation(movement?.id);
  const confirmMutation = useConfirmStockMovementMutation();

  const [type, setType] = useState<StockMovementType>(movement?.type ?? STOCK_MOVEMENT_TYPES.IN);
  const [locationId, setLocationId] = useState(movement?.locationId ?? '');
  const [reason, setReason] = useState(movement?.reason ?? '');
  const [movementDate, setMovementDate] = useState(movement?.movementDate ?? new Date().toISOString().slice(0, 10));
  const [lines, setLines] = useState<DraftLine[]>(
    movement?.lines.map((line) => ({
      key: line.id,
      variantId: line.variantId,
      productName: line.productName,
      sku: line.sku,
      quantity: line.quantity,
    })) ?? [],
  );

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());
  const productsQuery = useProductsQuery(
    { search: debouncedSearch, page: 1, pageSize: 10, excludeComposite: true },
    debouncedSearch.length > 0,
  );
  const searchResults = productsQuery.data?.items ?? [];

  const isEditable = !movement || movement.status === STOCK_MOVEMENT_STATUSES.DRAFT;
  const canSave = Boolean(locationId) && reason.trim().length > 0 && Boolean(movementDate) && lines.length > 0;

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

  function buildInput() {
    return {
      type,
      locationId,
      reason: reason.trim(),
      movementDate,
      lines: lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
    };
  }

  function handleSave(confirm: boolean) {
    if (movement) {
      saveMutation.mutate(buildInput(), {
        onSuccess: () => {
          if (confirm) {
            confirmMutation.mutate(movement.id, { onSuccess: () => router.push('/stock-operations') });
          } else {
            router.push('/stock-operations');
          }
        },
      });
    } else {
      saveMutation.mutate(
        { ...buildInput(), status: confirm ? STOCK_MOVEMENT_STATUSES.CONFIRMED : STOCK_MOVEMENT_STATUSES.DRAFT },
        { onSuccess: () => router.push('/stock-operations') },
      );
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/stock-operations" aria-label={t('back')} className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100">
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </Link>
        <h1 className="text-lg font-semibold text-zinc-900">{movement ? t('editDraft') : t('newMovement')}</h1>
      </div>

      <fieldset disabled={!isEditable} className="space-y-6 disabled:opacity-60">
        <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t('type')}</Label>
            <Select value={type} onValueChange={(value) => setType(value as StockMovementType)}>
              <SelectTrigger>
                <SelectValue>{t(`types.${type}`)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.values(STOCK_MOVEMENT_TYPES).map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(`types.${value}`)}
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
            <Label htmlFor="movementDate">{t('movementDate')}</Label>
            <Input id="movementDate" type="date" value={movementDate} onChange={(event) => setMovementDate(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reason">{t('reason')}</Label>
            <Input id="reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder={t('reasonPlaceholder')} />
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-zinc-900">{t('lineItems')}</h2>
          {isEditable && (
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('searchProducts')} className="ps-9" />
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
          )}

          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>{t('product')}</TableHeaderCell>
                <TableHeaderCell>{t('quantity')}</TableHeaderCell>
                {isEditable && <TableHeaderCell className="w-10" />}
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
        </div>
      </fieldset>

      {isEditable && (
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => router.push('/stock-operations')}>
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
