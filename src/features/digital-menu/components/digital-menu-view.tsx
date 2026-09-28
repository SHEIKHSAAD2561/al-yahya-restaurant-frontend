'use client';

import { useMemo, useState } from 'react';
import { Search, MapPin, UtensilsCrossed } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { useRouter } from '@/core/i18n/navigation';
import type { DigitalMenuData, DigitalMenuLocation } from '@/core/digital-menu/get-digital-menu';
import { buildMenuCategoryTree, categoryAndDescendantIds } from '../utils/category-tree';
import { MenuProductCard } from './menu-product-card';

const ALL_CATEGORIES = '__all__';

interface DigitalMenuViewProps {
  menu: DigitalMenuData;
  locations: DigitalMenuLocation[];
}

export function DigitalMenuView({ menu, locations }: DigitalMenuViewProps) {
  const t = useTranslations('digitalMenu');
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);

  const categoryTree = useMemo(() => buildMenuCategoryTree(menu.categories), [menu.categories]);
  const visibleIds = useMemo(() => {
    if (activeCategory === ALL_CATEGORIES) return null;
    const node = categoryTree.flatMap((root) => [root, ...root.children]).find((n) => n.id === activeCategory);
    return node ? categoryAndDescendantIds(node) : new Set([activeCategory]);
  }, [activeCategory, categoryTree]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return menu.products.filter((product) => {
      if (visibleIds && (!product.categoryId || !visibleIds.has(product.categoryId))) return false;
      if (term && !product.name.toLowerCase().includes(term) && !product.description?.toLowerCase().includes(term)) {
        return false;
      }
      return true;
    });
  }, [menu.products, visibleIds, search]);

  function handleLocationChange(locationId: string) {
    const params = new URLSearchParams(window.location.search);
    params.set('locationId', locationId);
    router.push(`/menu?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 pt-5">
          <div className="flex items-center gap-4">
            {menu.branding.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- public menu logo from an external Firebase URL
              <img src={menu.branding.logoUrl} alt={menu.branding.name ?? ''} className="size-14 shrink-0 rounded-xl object-contain" />
            ) : (
              <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand">
                <UtensilsCrossed className="size-7" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold text-zinc-900">{menu.branding.name ?? t('title')}</h1>
              <p className="truncate text-sm text-zinc-500">
                {[menu.branding.address, menu.branding.phone].filter(Boolean).join(' · ')}
              </p>
            </div>
            {locations.length > 1 && (
              <Select value={menu.location.id} onValueChange={handleLocationChange}>
                <SelectTrigger className="w-40 shrink-0">
                  <SelectValue>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-4 text-zinc-400" />
                      {menu.location.name}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('searchPlaceholder')}
              className="ps-9"
            />
          </div>
        </div>

        <nav className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-3">
          <button
            type="button"
            onClick={() => setActiveCategory(ALL_CATEGORIES)}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              activeCategory === ALL_CATEGORIES ? 'bg-brand text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200',
            )}
          >
            {t('allItems')}
          </button>
          {categoryTree.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                activeCategory === category.id ? 'bg-brand text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200',
              )}
            >
              {category.name}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {filteredProducts.length === 0 ? (
          <EmptyState icon={UtensilsCrossed} title={t('noItems')} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <MenuProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-8 pt-2 text-center text-xs text-zinc-400">
        {t('footerNote')}
      </footer>
    </div>
  );
}
