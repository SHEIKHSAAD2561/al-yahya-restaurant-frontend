'use client';

import { useState } from 'react';
import { MonitorSmartphone, Plus, Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/core/i18n/navigation';
import { usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { cn } from '@/lib/utils';
import { useRegistersQuery } from '../hooks/use-registers-query';
import { RegisterCard } from './register-card';

const ALL = 'ALL';

export function RegistersPage() {
  const t = useTranslations('registers');
  const locale = useLocale();
  const canManageSettings = usePermission(PERMISSIONS.POS_MANAGE_SALE_SETTINGS);
  const registersQuery = useRegistersQuery();

  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState(ALL);

  if (registersQuery.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const groups = registersQuery.data ?? [];
  const query = search.trim().toLowerCase();
  const filteredGroups = groups
    .filter((group) => locationFilter === ALL || group.locationId === locationFilter)
    .map((group) => ({
      ...group,
      registers: group.registers.filter(
        (register) => !query || register.name.toLowerCase().includes(query) || group.locationName.toLowerCase().includes(query),
      ),
    }));
  const hasAnyRegisters = groups.some((group) => group.registers.length > 0);

  return (
    <div className="space-y-4">
      <div className="relative w-full sm:w-96">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('searchPlaceholder')}
          className="ps-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setLocationFilter(ALL)}
          className={cn(
            'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
            locationFilter === ALL ? 'border-brand bg-brand-muted text-brand' : 'border-zinc-200 text-zinc-600',
          )}
        >
          {t('allLocations')}
        </button>
        {groups.map((group) => (
          <button
            key={group.locationId}
            type="button"
            onClick={() => setLocationFilter(group.locationId)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
              locationFilter === group.locationId ? 'border-brand bg-brand-muted text-brand' : 'border-zinc-200 text-zinc-600',
            )}
          >
            {group.locationName}
          </button>
        ))}
      </div>

      {!hasAnyRegisters ? (
        <EmptyState
          icon={MonitorSmartphone}
          title={t('noRegistersYet')}
          action={
            canManageSettings && groups[0] ? (
              <Button asChild>
                <Link href={`/pos/registers/new?locationId=${groups[0].locationId}`}>
                  <Plus className="size-4" />
                  {t('newRegister')}
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        filteredGroups
          .filter((group) => group.registers.length > 0 || locationFilter === group.locationId)
          .map((group) => (
            <div key={group.locationId} className="rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-900">{group.locationName}</h2>
                {canManageSettings && (
                  <Button asChild size="sm">
                    <Link href={`/pos/registers/new?locationId=${group.locationId}`}>
                      <Plus className="size-4" />
                      {t('newRegister')}
                    </Link>
                  </Button>
                )}
              </div>
              {group.registers.length === 0 ? (
                <p className="py-6 text-center text-sm text-zinc-400">{t('noRegistersForLocation')}</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.registers.map((register) => (
                    <RegisterCard key={register.id} register={register} locale={locale} />
                  ))}
                </div>
              )}
            </div>
          ))
      )}
    </div>
  );
}
