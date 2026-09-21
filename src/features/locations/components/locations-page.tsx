'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useLocationsQuery } from '../hooks/use-locations-query';
import { LocationListTable } from './location-list-table';
import { LocationDrawerForm } from './location-drawer-form';
import type { Location } from '../types/location';

export function LocationsPage() {
  const t = useTranslations('settings.locations');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const locationsQuery = useLocationsQuery();

  function openCreate() {
    setEditingLocation(null);
    setDrawerOpen(true);
  }

  function openEdit(location: Location) {
    setEditingLocation(location);
    setDrawerOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">
          {t('title')}
          {locationsQuery.data && (
            <span className="ms-2 text-sm font-normal text-zinc-400">
              ({locationsQuery.data.length})
            </span>
          )}
        </h1>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          {t('addLocation')}
        </Button>
      </div>

      <LocationListTable
        locations={locationsQuery.data ?? []}
        isLoading={locationsQuery.isPending}
        onEdit={openEdit}
      />

      <LocationDrawerForm open={drawerOpen} onOpenChange={setDrawerOpen} location={editingLocation} />
    </div>
  );
}
