'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { MultiSelectSheet } from '@/features/registers/components/multi-select-sheet';
import { useProductsQuery } from '@/features/products/hooks/use-products-query';
import { useCategoriesQuery } from '@/features/categories/hooks/use-categories-query';
import { categoryById, categoryPath } from '@/features/categories/utils/category-tree';
import { PROMOTION_TARGET_TYPES, type PromotionTargetType } from '../types/promotion';

interface TargetPickerProps {
  label: string;
  targetType: PromotionTargetType | undefined;
  onTargetTypeChange: (type: PromotionTargetType) => void;
  variantIds: string[];
  onVariantIdsChange: (ids: string[]) => void;
  categoryIds: string[];
  onCategoryIdsChange: (ids: string[]) => void;
}

/** Shared by all three targeting pickers in the Promotions forms (a Discount
 * off Products promotion's target, and a Buy X Get Y promotion's Buy/Get
 * sides) — All Products / Specific Products / Categories, with the latter two
 * opening `MultiSelectSheet` (reused from Registers) to pick from a fetched
 * list. Product options load a single page of up to 200 variants rather than
 * a server-searched picker — a reasonable size for one restaurant's catalog,
 * matching the "small, fully-loaded list" convention already used elsewhere
 * (see `TablePagination`'s own doc comment). */
export function TargetPicker({
  label,
  targetType,
  onTargetTypeChange,
  variantIds,
  onVariantIdsChange,
  categoryIds,
  onCategoryIdsChange,
}: TargetPickerProps) {
  const t = useTranslations('promotions');
  const [sheetOpen, setSheetOpen] = useState(false);
  const productsQuery = useProductsQuery({ page: 1, pageSize: 200 }, targetType === PROMOTION_TARGET_TYPES.SPECIFIC_PRODUCTS);
  const categoriesQuery = useCategoriesQuery();
  const byId = categoryById(categoriesQuery.data ?? []);

  const isProducts = targetType === PROMOTION_TARGET_TYPES.SPECIFIC_PRODUCTS;
  const isCategories = targetType === PROMOTION_TARGET_TYPES.CATEGORIES;

  const sheetItems = isProducts
    ? (productsQuery.data?.items ?? []).map((item) => ({ id: item.variantId, label: `${item.name} (${item.sku})` }))
    : (categoriesQuery.data ?? []).map((category) => ({ id: category.id, label: categoryPath(category, byId) }));

  const selectedCount = isProducts ? variantIds.length : categoryIds.length;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-800">{label}</label>
      <div className="grid grid-cols-3 gap-2">
        {Object.values(PROMOTION_TARGET_TYPES).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onTargetTypeChange(value)}
            className={cn(
              'rounded-lg border py-2 text-sm font-medium transition-colors',
              targetType === value ? 'border-brand bg-brand-muted text-brand' : 'border-zinc-200 text-zinc-600',
            )}
          >
            {t(`targetTypes.${value}`)}
          </button>
        ))}
      </div>
      {(isProducts || isCategories) && (
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="w-full rounded-lg border border-dashed border-zinc-300 py-2 text-sm text-zinc-600 hover:border-brand hover:text-brand"
        >
          {selectedCount > 0 ? t('itemsSelected', { count: selectedCount }) : t('selectItems')}
        </button>
      )}
      <MultiSelectSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={isProducts ? t('selectProducts') : t('selectCategories')}
        items={sheetItems}
        selectedIds={isProducts ? variantIds : categoryIds}
        onApply={isProducts ? onVariantIdsChange : onCategoryIdsChange}
      />
    </div>
  );
}
