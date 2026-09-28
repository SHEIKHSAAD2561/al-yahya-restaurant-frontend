'use client';

import { useState } from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/ui/query-error-state';
import { useLocationsQuery } from '@/features/locations/hooks/use-locations-query';
import { useDigitalMenuQuery } from '../hooks/use-digital-menu-query';
import { DigitalMenuView } from './digital-menu-view';

const ALL_LOCATIONS_DEFAULT = '__default__';

export function DigitalMenuAdminPage() {
  const t = useTranslations('digitalMenu');
  const locationsQuery = useLocationsQuery();
  const [locationId, setLocationId] = useState(ALL_LOCATIONS_DEFAULT);

  const menuQuery = useDigitalMenuQuery(locationId === ALL_LOCATIONS_DEFAULT ? undefined : locationId);
  const activeLocations = (locationsQuery.data ?? []).filter((location) => location.isActive);

  // `window.location.origin` is only ever read inside these click handlers,
  // never during render — reading it in the render body would mismatch the
  // server-rendered HTML on hydration (SSR has no `window`), and stashing it
  // in state via an effect would trip the React Compiler's
  // `set-state-in-effect` lint for no real benefit, since nothing here needs
  // to render differently before vs. after that value is known.
  function buildPublicUrl(): string | null {
    if (!menuQuery.data) return null;
    return `${window.location.origin}/menu?locationId=${menuQuery.data.location.id}`;
  }

  function copyLink() {
    const url = buildPublicUrl();
    if (!url) return;
    void navigator.clipboard.writeText(url).then(() => toast.success(t('linkCopied')));
  }

  function openPublicMenu() {
    const url = buildPublicUrl();
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
        <div>
          <h1 className="text-base font-semibold text-zinc-900">{t('adminTitle')}</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{t('adminIntro')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {activeLocations.length > 1 && (
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger className="w-44">
                <SelectValue>
                  {locationId === ALL_LOCATIONS_DEFAULT
                    ? t('defaultLocation')
                    : activeLocations.find((l) => l.id === locationId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_LOCATIONS_DEFAULT}>{t('defaultLocation')}</SelectItem>
                {activeLocations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button type="button" variant="outline" onClick={copyLink} disabled={!menuQuery.data}>
            <Copy className="size-4" />
            {t('copyLink')}
          </Button>
          <Button type="button" onClick={openPublicMenu} disabled={!menuQuery.data}>
            <ExternalLink className="size-4" />
            {t('openPublicMenu')}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200">
        {menuQuery.isPending ? (
          <Skeleton className="h-96 w-full" />
        ) : menuQuery.isError || !menuQuery.data ? (
          <QueryErrorState onRetry={() => void menuQuery.refetch()} />
        ) : (
          // No `locations` passed here — this preview's own location switcher
          // (above) already covers that; DigitalMenuView's built-in switcher
          // navigates to the public `/menu` route, which would be wrong
          // inside this embedded admin preview.
          <DigitalMenuView menu={menuQuery.data} locations={[]} />
        )}
      </div>
    </div>
  );
}
