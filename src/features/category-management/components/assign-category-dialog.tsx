'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAssignProductsMutation } from '@/features/categories/hooks/use-assign-products-mutation';
import { categoryById, categoryPath } from '@/features/categories/utils/category-tree';
import type { Category } from '@/features/categories/types/category';

const UNCATEGORIZED = '__uncategorized__';

interface AssignCategoryDialogProps {
  /** null closes the dialog; otherwise the product ids to (re)assign. */
  productIds: string[] | null;
  categories: Category[];
  onOpenChange: (open: boolean) => void;
}

export function AssignCategoryDialog({ productIds, categories, onOpenChange }: AssignCategoryDialogProps) {
  const t = useTranslations('categoryManagement');
  const tCommon = useTranslations('common');
  const { assign, unassign } = useAssignProductsMutation();
  const [value, setValue] = useState('');
  const byId = categoryById(categories);

  function handleOpenChange(next: boolean) {
    if (!next) setValue('');
    onOpenChange(next);
  }

  function handleSubmit() {
    if (!productIds) return;
    if (value === UNCATEGORIZED) {
      unassign.mutate(productIds, { onSuccess: () => handleOpenChange(false) });
    } else if (value) {
      assign.mutate({ categoryId: value, productIds }, { onSuccess: () => handleOpenChange(false) });
    }
  }

  return (
    <Dialog open={productIds !== null} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('assignToCategory', { count: productIds?.length ?? 0 })}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>{t('columnsCategory')}</Label>
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger>
              <SelectValue placeholder={t('selectPlaceholder')}>
                {value === UNCATEGORIZED
                  ? t('uncategorized')
                  : value
                    ? categoryPath(byId.get(value)!, byId)
                    : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNCATEGORIZED}>{t('uncategorized')}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {categoryPath(category, byId)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
            {tCommon('cancel')}
          </Button>
          <Button type="button" disabled={!value || assign.isPending || unassign.isPending} onClick={handleSubmit}>
            {tCommon('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
