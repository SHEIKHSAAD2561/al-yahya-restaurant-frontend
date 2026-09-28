'use client';

import { useState } from 'react';
import { Plus, Search, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useCustomerSearchQuery } from '@/features/customers/hooks/use-customer-search-query';
import { useQuickCreateCustomerMutation } from '@/features/customers/hooks/use-quick-create-customer-mutation';
import { useDebouncedValue } from '@/core/hooks/use-debounced-value';
import type { Customer } from '@/features/customers/types/customer';

interface CustomerPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (customer: Customer) => void;
}

/** POS "Add Customer" — search by name/phone/code, or quick-add (name +
 * phone only; the full Customer Details form lives on the Customers page). */
export function CustomerPickerDialog({ open, onOpenChange, onSelect }: CustomerPickerDialogProps) {
  const t = useTranslations('sellScreen');
  const [search, setSearch] = useState('');
  const [quickAddName, setQuickAddName] = useState('');
  const [quickAddPhone, setQuickAddPhone] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const searchQuery = useCustomerSearchQuery(debouncedSearch);
  const quickCreateMutation = useQuickCreateCustomerMutation();

  function handleOpenChange(next: boolean) {
    if (!next) {
      setSearch('');
      setQuickAddName('');
      setQuickAddPhone('');
    }
    onOpenChange(next);
  }

  function handleQuickAdd() {
    if (!quickAddName.trim() || !quickAddPhone.trim()) return;
    quickCreateMutation.mutate(
      { name: quickAddName.trim(), phone: quickAddPhone.trim() },
      {
        onSuccess: (customer) => {
          onSelect(customer);
          handleOpenChange(false);
        },
      },
    );
  }

  const results = searchQuery.data ?? [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('addCustomer')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <Input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('customerSearchPlaceholder')}
                className="ps-9"
              />
            </div>
          </div>

          {search.trim() && (
            <div className="max-h-56 overflow-y-auto rounded-lg border border-zinc-200">
              {searchQuery.isPending ? (
                <p className="px-3 py-4 text-center text-sm text-zinc-400">{t('searching')}</p>
              ) : results.length === 0 ? (
                <div className="space-y-2 p-3">
                  <p className="text-center text-sm text-zinc-400">{t('noMatches')}</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 text-xs text-zinc-500">
                    <tr>
                      <th className="px-3 py-2 text-start font-medium">{t('customerNameCode')}</th>
                      <th className="px-3 py-2 text-start font-medium">{t('customerPhone')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {results.map((customer) => (
                      <tr
                        key={customer.id}
                        className="cursor-pointer hover:bg-zinc-50"
                        onClick={() => {
                          onSelect(customer);
                          handleOpenChange(false);
                        }}
                      >
                        <td className="px-3 py-2">
                          <p className="font-medium text-zinc-900">{customer.name}</p>
                          <p className="text-xs text-zinc-400">{customer.code}</p>
                        </td>
                        <td dir="ltr" className="px-3 py-2 text-zinc-600 rtl:text-end">
                          {customer.phone}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          <div className="rounded-lg border border-dashed border-zinc-200 p-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-zinc-500">
              <User className="size-3.5" />
              {t('quickAddCustomer')}
            </p>
            <div className="flex flex-wrap gap-2">
              <Input
                value={quickAddName}
                onChange={(event) => setQuickAddName(event.target.value)}
                placeholder={t('customerName')}
                className="flex-1"
              />
              <Input
                dir="ltr"
                value={quickAddPhone}
                onChange={(event) => setQuickAddPhone(event.target.value)}
                placeholder={t('customerPhone')}
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                disabled={!quickAddName.trim() || !quickAddPhone.trim() || quickCreateMutation.isPending}
                onClick={handleQuickAdd}
                aria-label={t('add')}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

