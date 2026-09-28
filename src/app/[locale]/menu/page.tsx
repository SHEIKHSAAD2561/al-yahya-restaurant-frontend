import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getDigitalMenu, getDigitalMenuLocations } from '@/core/digital-menu/get-digital-menu';
import { DigitalMenuView } from '@/features/digital-menu/components/digital-menu-view';
import { EmptyState } from '@/components/ui/empty-state';
import { UtensilsCrossed } from 'lucide-react';

interface MenuRoutePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ locationId?: string }>;
}

export async function generateMetadata({ params }: MenuRoutePageProps): Promise<Metadata> {
  const { locale } = await params;
  const menu = await getDigitalMenu(locale);
  const name = menu?.branding.name ?? 'Restaurant';
  return {
    title: `${name} — Menu`,
    description: `Browse the menu for ${name}.`,
  };
}

export default async function MenuRoutePage({ params, searchParams }: MenuRoutePageProps) {
  const { locale } = await params;
  const { locationId } = await searchParams;
  const t = await getTranslations('digitalMenu');

  const [menu, locations] = await Promise.all([getDigitalMenu(locale, locationId), getDigitalMenuLocations(locale)]);

  if (!menu) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <EmptyState icon={UtensilsCrossed} title={t('unavailable')} />
      </div>
    );
  }

  return <DigitalMenuView menu={menu} locations={locations} />;
}
