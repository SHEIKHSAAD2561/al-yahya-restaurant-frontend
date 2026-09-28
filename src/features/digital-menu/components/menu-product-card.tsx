'use client';

import { UtensilsCrossed } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { DigitalMenuProduct } from '@/core/digital-menu/get-digital-menu';

function formatPrice(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function MenuProductCard({ product }: { product: DigitalMenuProduct }) {
  const t = useTranslations('digitalMenu');
  const anyInStock = product.variants.some((variant) => variant.inStock);
  const hasPriceRange = product.minPrice !== product.maxPrice;
  const hasNamedVariants = product.variants.length > 1 && product.variants.some((v) => v.optionValues?.length);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- public menu image from an external Firebase URL, not a Next-optimized page image
          <img
            src={product.imageUrl}
            alt={product.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-zinc-300">
            <UtensilsCrossed className="size-10" />
          </div>
        )}
        {!anyInStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-900">
              {t('soldOut')}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-semibold text-zinc-900">{product.name}</h3>
        {product.description && <p className="line-clamp-2 text-sm text-zinc-500">{product.description}</p>}

        {hasNamedVariants ? (
          <ul className="mt-2 space-y-1 border-t border-dashed border-zinc-200 pt-2 text-sm">
            {product.variants.map((variant) => (
              <li key={variant.id} className="flex items-center justify-between gap-2 text-zinc-600">
                <span className={variant.inStock ? '' : 'text-zinc-400 line-through'}>
                  {variant.optionValues?.join(' / ') || product.name}
                </span>
                <span className="font-medium text-zinc-900">{formatPrice(variant.price)} {t('currency')}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-auto pt-2 text-lg font-semibold text-brand">
            {hasPriceRange ? `${formatPrice(product.minPrice)} – ${formatPrice(product.maxPrice)}` : formatPrice(product.minPrice)}{' '}
            <span className="text-sm font-normal text-zinc-500">{t('currency')}</span>
          </p>
        )}
      </div>
    </div>
  );
}
