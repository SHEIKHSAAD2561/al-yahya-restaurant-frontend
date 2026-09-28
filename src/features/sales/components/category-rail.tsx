'use client';

import { Grid2x2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useCategoriesQuery } from '@/features/categories/hooks/use-categories-query';

export type CategoryFilter = { kind: 'all' } | { kind: 'uncategorized' } | { kind: 'category'; id: string };

export function CategoryRail({
  value,
  onChange,
}: {
  value: CategoryFilter;
  onChange: (filter: CategoryFilter) => void;
}) {
  const t = useTranslations('sellScreen');
  const categoriesQuery = useCategoriesQuery();
  // Flat pills, top-level categories only — POS browsing doesn't need the
  // full parent/child tree Category Management shows.
  const topLevel = (categoriesQuery.data ?? []).filter((category) => category.depth === 1);

  const pill = (active: boolean, label: string, onClick: () => void, key: string) => (
    <button
      key={key}
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
        active ? 'border-brand bg-brand-muted text-brand' : 'border-zinc-200 text-zinc-600 hover:border-zinc-300',
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <button
        type="button"
        onClick={() => onChange({ kind: 'all' })}
        aria-label={t('allProducts')}
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
          value.kind === 'all' ? 'border-brand bg-brand-muted text-brand' : 'border-zinc-200 text-zinc-500',
        )}
      >
        <Grid2x2 className="size-4" />
      </button>
      {pill(value.kind === 'uncategorized', t('uncategorizedProducts'), () => onChange({ kind: 'uncategorized' }), 'uncategorized')}
      {topLevel.map((category) =>
        pill(
          value.kind === 'category' && value.id === category.id,
          category.name,
          () => onChange({ kind: 'category', id: category.id }),
          category.id,
        ),
      )}
    </div>
  );
}
