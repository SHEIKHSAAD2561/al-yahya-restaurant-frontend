'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategoriesQuery } from '@/features/categories/hooks/use-categories-query';
import { useUncategorizedCountQuery } from '@/features/categories/hooks/use-uncategorized-count-query';
import { useAssignProductsMutation } from '@/features/categories/hooks/use-assign-products-mutation';
import { CategorySidebar, type SelectedBucket } from './category-sidebar';
import { CategoryProductsPanel } from './category-products-panel';
import { NewCategoryDialog } from './new-category-dialog';
import { AssignCategoryDialog } from './assign-category-dialog';

export function CategoryManagementPage() {
  const t = useTranslations('categoryManagement');
  const categoriesQuery = useCategoriesQuery();
  const uncategorizedCountQuery = useUncategorizedCountQuery();
  const { unassign } = useAssignProductsMutation();

  const [selected, setSelected] = useState<SelectedBucket>({ kind: 'uncategorized' });
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [newCategoryAssignIds, setNewCategoryAssignIds] = useState<string[]>([]);
  const [assignTargetIds, setAssignTargetIds] = useState<string[] | null>(null);

  if (categoriesQuery.isPending || uncategorizedCountQuery.isPending) {
    return (
      <div className="flex gap-6">
        <Skeleton className="h-96 w-72 shrink-0 rounded-2xl" />
        <Skeleton className="h-96 flex-1 rounded-2xl" />
      </div>
    );
  }

  const categories = categoriesQuery.data ?? [];
  const uncategorizedCount = uncategorizedCountQuery.data?.count ?? 0;
  const selectedCategory = selected.kind === 'category' ? categories.find((c) => c.id === selected.id) : undefined;
  // The selected category was deleted/renamed out from under us (shouldn't
  // normally happen — there's no delete yet — but falls back safely).
  const title = selected.kind === 'uncategorized' ? t('uncategorized') : (selectedCategory?.name ?? t('uncategorized'));
  const productCount = selected.kind === 'uncategorized' ? uncategorizedCount : (selectedCategory?.productCount ?? 0);

  function openAddDialog() {
    setNewCategoryAssignIds([]);
    setNewCategoryOpen(true);
  }
  function openCreateAndAssign(checkedProductIds: string[]) {
    setNewCategoryAssignIds(checkedProductIds);
    setNewCategoryOpen(true);
  }

  return (
    <div>
      <h1 className="sr-only">{t('title')}</h1>
      <div className="flex gap-6">
        <CategorySidebar
          categories={categories}
          uncategorizedCount={uncategorizedCount}
          selected={selected.kind === 'category' && !selectedCategory ? { kind: 'uncategorized' } : selected}
          onSelect={setSelected}
          onAdd={openAddDialog}
        />
        <CategoryProductsPanel
          bucket={selected}
          title={title}
          productCount={productCount}
          onAssignRow={(productId) => setAssignTargetIds([productId])}
          onAssignSelected={setAssignTargetIds}
          onUnassignSelected={(productIds) => unassign.mutate(productIds)}
          onCreateAndAssign={openCreateAndAssign}
        />
      </div>

      <NewCategoryDialog
        open={newCategoryOpen}
        onOpenChange={setNewCategoryOpen}
        categories={categories}
        assignProductIds={newCategoryAssignIds}
      />
      <AssignCategoryDialog
        productIds={assignTargetIds}
        categories={categories}
        onOpenChange={(open) => !open && setAssignTargetIds(null)}
      />
    </div>
  );
}
