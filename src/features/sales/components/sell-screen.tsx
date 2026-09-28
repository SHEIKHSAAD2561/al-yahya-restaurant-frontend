'use client';

import { useState } from 'react';
import { ArrowLeft, Search, Trash2, User, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { QueryErrorState } from '@/components/ui/query-error-state';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/core/i18n/navigation';
import { usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { useDebouncedValue } from '@/core/hooks/use-debounced-value';
import { cn } from '@/lib/utils';
import { useRegisterQuery } from '@/features/registers/hooks/use-register-query';
import { useParkedSalesQuery } from '../hooks/use-parked-sales-query';
import { useParkSaleMutation } from '../hooks/use-park-sale-mutation';
import { useProductFormOptionsQuery } from '@/features/products/hooks/use-product-form-options-query';
import { AddWithdrawDialog } from '@/features/registers/components/add-withdraw-dialog';
import { InvoiceListPage } from './invoice-list-page';
import { CategoryRail, type CategoryFilter } from './category-rail';
import { ProductGrid } from './product-grid';
import { CartPanel } from './cart-panel';
import { CustomerPickerDialog } from './customer-picker-dialog';
import { ParkedSalesDialog } from './parked-sales-dialog';
import { PayDialog } from './pay-dialog';
import { SELL_AT, type DiscountType, type Sale, type SellAt } from '../types/sale';
import type { CartLine } from '../types/cart';
import type { Customer } from '@/features/customers/types/customer';

type Tab = 'sell' | 'invoices';

export function SellScreen({ registerId }: { registerId: string }) {
  const t = useTranslations('sellScreen');
  const tRegisters = useTranslations('registers');
  const registerQuery = useRegisterQuery(registerId);
  const formOptionsQuery = useProductFormOptionsQuery();
  const parkedQuery = useParkedSalesQuery(registerId);
  const parkMutation = useParkSaleMutation();
  const canWholesale = usePermission(PERMISSIONS.POS_SELL_WHOLESALE);
  const canParkSale = usePermission(PERMISSIONS.POS_PARK_SALE);
  const canManageCash = usePermission(PERMISSIONS.POS_MANAGE_CASH);

  const [tab, setTab] = useState<Tab>('sell');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>({ kind: 'all' });
  const [sellAt, setSellAt] = useState<SellAt>(SELL_AT.RETAIL);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [note, setNote] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType | null>(null);
  const [discountValue, setDiscountValue] = useState<number | null>(null);
  const [parkedSaleId, setParkedSaleId] = useState<string | null>(null);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [parkedDialogOpen, setParkedDialogOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [cashDialogOpen, setCashDialogOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(search);

  if (registerQuery.isPending || formOptionsQuery.isPending) {
    return <Skeleton className="h-96 w-full" />;
  }
  // isPending only covers the first, in-flight load — a request that fails
  // outright (backend restart, network blip) settles into isPending: false
  // with data still undefined, which a bare `!` would paper over and crash
  // on the next line. Surface it instead, with a way to retry.
  if (registerQuery.isError || formOptionsQuery.isError || !registerQuery.data || !formOptionsQuery.data) {
    return (
      <QueryErrorState
        onRetry={() => {
          void registerQuery.refetch();
          void formOptionsQuery.refetch();
        }}
      />
    );
  }
  const register = registerQuery.data;
  const formOptions = formOptionsQuery.data;

  function resetCart() {
    setLines([]);
    setCustomer(null);
    setNote('');
    setDiscountType(null);
    setDiscountValue(null);
    setParkedSaleId(null);
  }

  function addLine(line: CartLine) {
    setLines((current) => {
      const existing = current.find((candidate) => candidate.variantId === line.variantId);
      if (existing) {
        return current.map((candidate) =>
          candidate.variantId === line.variantId ? { ...candidate, quantity: candidate.quantity + 1 } : candidate,
        );
      }
      return [...current, line];
    });
  }

  function updateQuantity(variantId: string, quantity: number) {
    setLines((current) => current.map((line) => (line.variantId === variantId ? { ...line, quantity } : line)));
  }

  function removeLine(variantId: string) {
    setLines((current) => current.filter((line) => line.variantId !== variantId));
  }

  function clearCart() {
    if (lines.length === 0) return;
    if (confirm(t('confirmClearCart'))) resetCart();
  }

  function handlePause() {
    if (lines.length === 0) return;
    parkMutation.mutate(
      {
        id: parkedSaleId ?? undefined,
        registerId,
        customerId: customer?.id,
        sellAt,
        discountType: discountType ?? undefined,
        discountValue: discountValue ?? undefined,
        note: note || undefined,
        lines: lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
      },
      {
        onSuccess: () => {
          toast.success(t('saleParked'));
          resetCart();
        },
      },
    );
  }

  function handleResume(sale: Sale) {
    setLines(sale.lines.map((line) => ({ variantId: line.variantId, name: line.productName, sku: line.sku, imageUrl: null, unitPrice: line.unitPrice, quantity: line.quantity })));
    setCustomer(sale.customerId ? ({ id: sale.customerId, name: sale.customerName ?? '' } as Customer) : null);
    setSellAt(sale.sellAt);
    setNote(sale.note ?? '');
    setDiscountType(sale.discountType);
    setDiscountValue(sale.discountValue);
    setParkedSaleId(sale.id);
  }

  const cartQuantityByVariant = new Map(lines.map((line) => [line.variantId, line.quantity]));
  const hasParkedSales = (parkedQuery.data?.length ?? 0) > 0;

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/pos" aria-label={tRegisters('back')} className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100">
            <ArrowLeft className="size-5 rtl:rotate-180" />
          </Link>
          <h1 className="text-lg font-semibold text-zinc-900">{register.name}</h1>
          <Link href={`/pos/registers/${registerId}/close`} className="text-sm text-red-600 hover:underline">
            {tRegisters('closeRegister')}
          </Link>
        </div>
        {canManageCash && (
          <Button variant="outline" size="sm" onClick={() => setCashDialogOpen(true)}>
            {tRegisters('addWithdraw')}
          </Button>
        )}
      </div>

      <div className="flex gap-4 border-b border-zinc-200">
        {(['sell', 'invoices'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              'border-b-2 px-1 pb-2 text-sm font-medium transition-colors',
              tab === value ? 'border-brand text-brand' : 'border-transparent text-zinc-500 hover:text-zinc-800',
            )}
          >
            {t(value === 'sell' ? 'sellScreenTab' : 'invoiceListTab')}
          </button>
        ))}
      </div>

      {tab === 'invoices' ? (
        <InvoiceListPage locationId={register.locationId} />
      ) : (
        <>
          <CategoryRail value={category} onChange={setCategory} />

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-52 flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('scanOrTypeProduct')}
                className="ps-9"
              />
            </div>

            {canWholesale && (
              <div className="flex rounded-lg border border-zinc-200 p-0.5">
                {Object.values(SELL_AT).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSellAt(value)}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                      sellAt === value ? 'bg-brand text-brand-foreground' : 'text-zinc-500',
                    )}
                  >
                    {t(`sellAt.${value}`)}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setCustomerDialogOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 hover:border-zinc-300"
            >
              <User className="size-4" />
              {customer ? customer.name : t('customer')}
              {customer && (
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={(event) => {
                    event.stopPropagation();
                    setCustomer(null);
                  }}
                >
                  <X className="size-3.5" />
                </span>
              )}
            </button>

            {canParkSale && (
              <button
                type="button"
                onClick={() => (lines.length === 0 ? setParkedDialogOpen(true) : handlePause())}
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-300"
              >
                {lines.length === 0
                  ? hasParkedSales
                    ? t('continueSale', { count: parkedQuery.data?.length ?? 0 })
                    : t('continueSale', { count: 0 })
                  : t('pauseSale')}
              </button>
            )}

            <button
              type="button"
              onClick={clearCart}
              disabled={lines.length === 0}
              aria-label={t('clearCart')}
              className="rounded-lg border border-zinc-200 p-2 text-zinc-400 hover:border-red-200 hover:text-red-600 disabled:opacity-40"
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_360px]">
            <ProductGrid
              search={debouncedSearch}
              category={category}
              sellAt={sellAt}
              cartQuantityByVariant={cartQuantityByVariant}
              onAdd={addLine}
            />
            <CartPanel
              lines={lines}
              onQuantityChange={updateQuantity}
              onRemove={removeLine}
              note={note}
              onNoteChange={setNote}
              discountType={discountType}
              discountValue={discountValue}
              onDiscountChange={(type, value) => {
                setDiscountType(type);
                setDiscountValue(value);
              }}
              taxStatusLabel={t(`taxStatus.${formOptions.sellTaxStatus}`)}
              onPay={() => setPayOpen(true)}
            />
          </div>
        </>
      )}

      <CustomerPickerDialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen} onSelect={setCustomer} />
      <ParkedSalesDialog
        open={parkedDialogOpen}
        onOpenChange={setParkedDialogOpen}
        registerId={registerId}
        onResume={handleResume}
      />
      <PayDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        registerId={registerId}
        parkedSaleId={parkedSaleId}
        customerId={customer?.id ?? null}
        customerName={customer?.name ?? null}
        sellAt={sellAt}
        discountType={discountType}
        discountValue={discountValue}
        note={note}
        lines={lines}
        paymentMethods={register.paymentMethods}
        onCompleted={() => resetCart()}
      />
      <AddWithdrawDialog open={cashDialogOpen} onOpenChange={setCashDialogOpen} registerId={registerId} />
    </div>
  );
}
