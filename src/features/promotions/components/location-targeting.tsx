'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MultiSelectSheet } from '@/features/registers/components/multi-select-sheet';
import { useLocationsQuery } from '@/features/locations/hooks/use-locations-query';

interface LocationTargetingProps {
  applyToAllLocations: boolean;
  onApplyToAllLocationsChange: (value: boolean) => void;
  locationIds: string[];
  onLocationIdsChange: (ids: string[]) => void;
}

export function LocationTargeting({
  applyToAllLocations,
  onApplyToAllLocationsChange,
  locationIds,
  onLocationIdsChange,
}: LocationTargetingProps) {
  const t = useTranslations('promotions');
  const locationsQuery = useLocationsQuery();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="applyToAllLocations">{t('applyToAllLocations')}</Label>
        <Switch id="applyToAllLocations" checked={applyToAllLocations} onCheckedChange={onApplyToAllLocationsChange} />
      </div>
      {!applyToAllLocations && (
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="w-full rounded-lg border border-dashed border-zinc-300 py-2 text-sm text-zinc-600 hover:border-brand hover:text-brand"
        >
          {locationIds.length > 0 ? t('locationsSelected', { count: locationIds.length }) : t('selectLocations')}
        </button>
      )}
      <MultiSelectSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={t('selectLocations')}
        items={(locationsQuery.data ?? []).map((location) => ({ id: location.id, label: location.name }))}
        selectedIds={locationIds}
        onApply={onLocationIdsChange}
      />
    </div>
  );
}
