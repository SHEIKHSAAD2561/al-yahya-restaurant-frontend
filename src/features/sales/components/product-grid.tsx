'use client';

import Image from 'next/image';
import { ImageIcon, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useProductsQuery } from '@/features/products/hooks/use-products-query';
import { cn } from '@/lib/utils';
import type { CategoryFilter } from './category-rail';
import type { CartLine } from '../types/cart';
import type { SellAt } from '../types/sale';

interface ProductGridProps {
  search: string;
  category: CategoryFilter;
  sellAt: SellAt;
  cartQuantityByVariant: Map<string, number>;
  onAdd: (line: CartLine) => void;
}

export function ProductGrid({ search, category, sellAt, cartQuantityByVariant, onAdd }: ProductGridProps) {
  const t = useTranslations('sellScreen');
  const productsQuery = useProductsQuery({
    search,
    categoryId: category.kind === 'category' ? category.id : undefined,
    uncategorized: category.kind === 'uncategorized',
    sort: 'NAME_ASC',
    pageSize: 100,
  });

  const items = productsQuery.data?.items ?? [];

  if (productsQuery.isPending) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyState icon={Package} title={t('noProducts')} />;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => {
        const price = sellAt === 'WHOLESALE' ? item.wholesalePrice : item.retailPrice;
        const inCart = cartQuantityByVariant.get(item.variantId) ?? 0;
        const outOfStock = item.quantity !== undefined && item.quantity - inCart <= 0;
        const disabled = price === null || outOfStock;

        return (
          <button
            key={item.variantId}
            type="button"
            disabled={disabled}
            onClick={() =>
              price !== null &&
              onAdd({ variantId: item.variantId, name: item.name, sku: item.sku, imageUrl: item.imageUrl, unitPrice: price, quantity: 1 })
            }
            className={cn(
              'relative flex h-28 flex-col justify-between overflow-hidden rounded-xl bg-zinc-700 p-3 text-start text-white transition-transform',
              disabled ? 'cursor-not-allowed opacity-40' : 'hover:scale-[1.02]',
            )}
          >
            {item.imageUrl && (
              <Image src={item.imageUrl} alt="" fill className="object-cover opacity-40" unoptimized />
            )}
            <span className="relative text-xs font-semibold">
              {price !== null ? price.toFixed(2) : '—'} <span className="font-normal opacity-80">{t('currency')}</span>
            </span>
            <span className="relative flex items-end justify-between gap-1">
              <span className="line-clamp-2 text-sm font-medium">{item.name}</span>
              {!item.imageUrl && <ImageIcon className="size-4 shrink-0 opacity-50" />}
            </span>
            {inCart > 0 && (
              <span className="absolute end-2 top-2 flex size-6 items-center justify-center rounded-full bg-brand text-xs font-semibold text-brand-foreground">
                {inCart}
              </span>
            )}
            {outOfStock && (
              <span className="absolute inset-x-0 bottom-0 bg-red-600/90 py-1 text-center text-[11px] font-medium">
                {t('outOfStock')}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
