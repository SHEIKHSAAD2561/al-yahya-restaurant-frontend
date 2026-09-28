'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebouncedValue } from '@/core/hooks/use-debounced-value';
import { useCustomerSearchQuery } from '@/features/customers/hooks/use-customer-search-query';
import { useCustomerQuery } from '@/features/customers/hooks/use-customer-query';
import { usePaymentMethodsQuery } from '@/features/payment-methods/hooks/use-payment-methods-query';
import { useCreateCustomerPaymentMutation } from '../hooks/use-customer-payment-mutations';

const NO_METHOD = '__none__';

function formatCurrency(value: number): string {
  return `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`;
}

export function CustomerPaymentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations('customerPayments');
  const tCommon = useTranslations('common');
  const paymentMethodsQuery = usePaymentMethodsQuery();
  const createMutation = useCreateCustomerPaymentMutation();

  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());
  const searchQuery = useCustomerSearchQuery(debouncedSearch);
  const selectedCustomerQuery = useCustomerQuery(customerId || undefined);

  const [amount, setAmount] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState(NO_METHOD);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  const amountValue = Number(amount);
  const canSave = Boolean(customerId) && amount.trim() !== '' && Number.isFinite(amountValue) && amountValue > 0;

  function reset() {
    setCustomerId('');
    setCustomerName('');
    setSearch('');
    setAmount('');
    setPaymentMethodId(NO_METHOD);
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setNotes('');
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function selectCustomer(id: string, name: string) {
    setCustomerId(id);
    setCustomerName(name);
    setSearch('');
  }

  function handleSubmit() {
    createMutation.mutate(
      {
        customerId,
        amount: amountValue,
        paymentMethodId: paymentMethodId === NO_METHOD ? undefined : paymentMethodId,
        paymentDate,
        notes: notes.trim() || undefined,
      },
      { onSuccess: () => handleOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('recordPayment')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t('customer')}</Label>
            {customerId ? (
              <div className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm">
                <span className="font-medium text-zinc-900">{customerName}</span>
                <button
                  type="button"
                  onClick={() => selectCustomer('', '')}
                  className="text-xs font-medium text-brand hover:underline"
                >
                  {t('changeCustomer')}
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('searchCustomers')}
                  className="ps-9"
                />
                {debouncedSearch && (searchQuery.data?.length ?? 0) > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-md">
                    {searchQuery.data!.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => selectCustomer(customer.id, customer.name)}
                        className="flex w-full items-center justify-between px-3 py-2 text-start text-sm hover:bg-zinc-50"
                      >
                        <span>
                          {customer.name} <span className="text-zinc-400">({customer.code})</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {customerId && selectedCustomerQuery.data && (
              <p className="text-xs text-zinc-500">
                {t('currentBalance', { amount: formatCurrency(selectedCustomerQuery.data.debitAmount) })}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="paymentAmount">{t('amount')}</Label>
              <Input
                id="paymentAmount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="paymentDate">{t('date')}</Label>
              <Input id="paymentDate" type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t('paymentMethod')}</Label>
            <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
              <SelectTrigger>
                <SelectValue>
                  {paymentMethodId === NO_METHOD
                    ? t('none')
                    : paymentMethodsQuery.data?.find((m) => m.id === paymentMethodId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_METHOD}>{t('none')}</SelectItem>
                {(paymentMethodsQuery.data ?? []).map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="paymentNotes">{t('notes')}</Label>
            <Input id="paymentNotes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={255} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
            {tCommon('cancel')}
          </Button>
          <Button type="button" disabled={!canSave || createMutation.isPending} onClick={handleSubmit}>
            {tCommon('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
