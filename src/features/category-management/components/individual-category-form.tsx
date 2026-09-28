'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateCategoryDetailedMutation } from '@/features/categories/hooks/use-create-category-detailed-mutation';
import { categoryById, categoryPath } from '@/features/categories/utils/category-tree';
import { MAX_CATEGORY_DEPTH, type Category } from '@/features/categories/types/category';

interface IndividualCategoryFormProps {
  categories: Category[];
  /** Products to assign to the new category once it's created (the checked
   * rows when this was opened from "Create category & assign"). */
  assignProductIds: string[];
  onDone: () => void;
  onCancel: () => void;
}

export function IndividualCategoryForm({ categories, assignProductIds, onDone, onCancel }: IndividualCategoryFormProps) {
  const t = useTranslations('categoryManagement');
  const tCommon = useTranslations('common');
  const createMutation = useCreateCategoryDetailedMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [hasParent, setHasParent] = useState(false);
  const [parentId, setParentId] = useState('');

  // A sub-child (depth 3) can't have children of its own.
  const parentOptions = categories.filter((category) => category.depth < MAX_CATEGORY_DEPTH);
  const byId = categoryById(categories);

  function handleSubmit() {
    createMutation.mutate(
      {
        name: name.trim(),
        description: description.trim() || null,
        parentId: hasParent && parentId ? parentId : null,
        assignProductIds: assignProductIds.length > 0 ? assignProductIds : undefined,
      },
      { onSuccess: onDone },
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="categoryName">
          <span className="text-red-600">*</span> {t('categoryName')}
        </Label>
        <Input
          id="categoryName"
          autoFocus
          placeholder={t('categoryNamePlaceholder')}
          value={name}
          maxLength={100}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="categoryDescription">{t('description')}</Label>
        <textarea
          id="categoryDescription"
          rows={3}
          placeholder={t('descriptionPlaceholder')}
          value={description}
          maxLength={500}
          onChange={(event) => setDescription(event.target.value)}
          className="flex w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="hasParentToggle">{t('parentCategory')}</Label>
        <Switch id="hasParentToggle" checked={hasParent} onCheckedChange={setHasParent} />
      </div>

      {hasParent && (
        <div className="space-y-1.5">
          <Label>{t('selectParentCategory')}</Label>
          <Select value={parentId} onValueChange={setParentId}>
            <SelectTrigger>
              <SelectValue placeholder={t('selectPlaceholder')}>
                {parentId ? categoryPath(byId.get(parentId)!, byId) : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {parentOptions.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {categoryPath(category, byId)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {tCommon('cancel')}
        </Button>
        <Button
          type="button"
          disabled={!name.trim() || (hasParent && !parentId) || createMutation.isPending}
          onClick={handleSubmit}
        >
          {t('createAndAssign')}
        </Button>
      </div>
    </div>
  );
}
