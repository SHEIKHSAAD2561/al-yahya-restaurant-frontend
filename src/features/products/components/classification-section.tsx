'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import type { Category } from '@/features/categories/types/category';
import type { Brand } from '@/features/brands/types/brand';
import { useCreateCategoryMutation } from '@/features/categories/hooks/use-create-category-mutation';
import { useCreateBrandMutation } from '@/features/brands/hooks/use-create-brand-mutation';
import { categoryById, categoryPath } from '@/features/categories/utils/category-tree';
import type { ProductFormValues } from '../schemas/product-form.schema';
import { CreateNamedItemDialog } from './create-named-item-dialog';
import { FormSection } from './form-section';

/** Sentinel for "no category/brand" — Radix <SelectItem> can't use ''. */
const NONE = '__none__';

export function ClassificationSection({
  categories,
  brands,
  readOnly,
}: {
  categories: Category[];
  brands: Brand[];
  readOnly: boolean;
}) {
  const t = useTranslations('products');
  const { setValue } = useFormContext<ProductFormValues>();
  // Categories have their own permission (Category Management); brands have
  // none, so anyone creating/editing a product may add one.
  const canManageCategories = usePermission(PERMISSIONS.PRODUCTS_MANAGE_CATEGORIES);
  const [dialog, setDialog] = useState<'category' | 'brand' | null>(null);
  const createCategory = useCreateCategoryMutation();
  const createBrand = useCreateBrandMutation();

  function handleCreate(name: string) {
    const mutation = dialog === 'category' ? createCategory : createBrand;
    const field = dialog === 'category' ? 'categoryId' : 'brandId';
    mutation.mutate(name, {
      onSuccess: (created) => {
        setValue(field, created.id, { shouldDirty: true });
        setDialog(null);
      },
    });
  }

  const categoriesById = categoryById(categories);

  return (
    <FormSection title={t('form.classification')} hint={t('form.classificationHint')}>
      <div className="space-y-4">
        <ClassificationSelect
          name="categoryId"
          label={t('columns.category')}
          items={categories}
          // "Cakes / Small Cake" — a flat dropdown still needs the ancestry
          // to disambiguate same-named categories under different parents.
          labelFor={(category) => categoryPath(category, categoriesById)}
          canCreate={!readOnly && canManageCategories}
          onCreate={() => setDialog('category')}
        />
        <ClassificationSelect
          name="brandId"
          label={t('form.brand')}
          items={brands}
          canCreate={!readOnly}
          onCreate={() => setDialog('brand')}
        />
      </div>

      <CreateNamedItemDialog
        open={dialog !== null}
        onOpenChange={(open) => !open && setDialog(null)}
        title={dialog === 'category' ? t('form.newCategory') : t('form.newBrand')}
        label={dialog === 'category' ? t('columns.category') : t('form.brand')}
        isPending={createCategory.isPending || createBrand.isPending}
        onCreate={handleCreate}
      />
    </FormSection>
  );
}

function ClassificationSelect<T extends { id: string; name: string }>({
  name,
  label,
  items,
  labelFor = (item) => item.name,
  canCreate,
  onCreate,
}: {
  name: 'categoryId' | 'brandId';
  label: string;
  items: T[];
  labelFor?: (item: T) => string;
  canCreate: boolean;
  onCreate: () => void;
}) {
  const t = useTranslations('products');
  const { control } = useFormContext<ProductFormValues>();
  const itemName = (id: string) => {
    const item = items.find((candidate) => candidate.id === id);
    return item ? labelFor(item) : undefined;
  };

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <Select value={field.value} onValueChange={(value) => field.onChange(value === NONE ? '' : value)}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={t('form.select')}>
                  {field.value ? itemName(field.value) : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{t('form.none')}</SelectItem>
                {items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {labelFor(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {canCreate && (
          <button
            type="button"
            onClick={onCreate}
            aria-label={t('form.addNew', { name: label })}
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand hover:bg-brand-muted/70"
          >
            <Plus className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
