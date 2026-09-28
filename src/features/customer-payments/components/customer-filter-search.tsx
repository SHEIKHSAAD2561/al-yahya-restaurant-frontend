'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/core/hooks/use-debounced-value';
import { useCustomerSearchQuery } from '@/features/customers/hooks/use-customer-search-query';

interface CustomerFilterSearchProps {
  customerId: string;
  customerName: string;
  onChange: (customerId: string, customerName: string) => void;
}

/** A search-to-select customer filter, used in place of a `<Select>` of every
 * customer (unlike Suppliers, which is a small, fully-loaded list — Customers
 * is paginated and can be large, so a live search is the only sane picker). */
export function CustomerFilterSearch({ customerId, customerName, onChange }: CustomerFilterSearchProps) {
  const t = useTranslations('customerPayments');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());
  const searchQuery = useCustomerSearchQuery(debouncedSearch);

  if (customerId) {
    return (
      <div className="flex w-64 items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm">
        <span className="truncate font-medium text-zinc-900">{customerName}</span>
        <button type="button" onClick={() => onChange('', '')} aria-label={t('clearFilter')} className="text-zinc-400 hover:text-zinc-600">
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-64">
      <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
      <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('filterByCustomer')} className="ps-9" />
      {debouncedSearch && (searchQuery.data?.length ?? 0) > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-md">
          {searchQuery.data!.map((customer) => (
            <button
              key={customer.id}
              type="button"
              onClick={() => {
                onChange(customer.id, customer.name);
                setSearch('');
              }}
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
  );
}
