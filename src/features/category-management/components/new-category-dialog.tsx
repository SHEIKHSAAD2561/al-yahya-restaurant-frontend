'use client';

import { useState } from 'react';
import { FolderTree, FolderPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Category } from '@/features/categories/types/category';
import { CategoryTreeForm } from './category-tree-form';
import { IndividualCategoryForm } from './individual-category-form';

type Choice = 'tree' | 'individual';

interface NewCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  /** Products to assign to the resulting category — the checked rows behind
   * "Create category & assign". Empty for the sidebar's plain "Add". */
  assignProductIds: string[];
}

export function NewCategoryDialog({ open, onOpenChange, categories, assignProductIds }: NewCategoryDialogProps) {
  const t = useTranslations('categoryManagement');
  const tCommon = useTranslations('common');
  const [choice, setChoice] = useState<Choice | null>(null);
  const [step, setStep] = useState<'choose' | 'form'>('choose');

  function handleOpenChange(next: boolean) {
    if (!next) {
      setChoice(null);
      setStep('choose');
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={cn(step === 'form' && choice === 'tree' ? 'max-w-3xl' : 'max-w-lg')}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="size-5 text-brand" />
            {t('newCategory')}
          </DialogTitle>
        </DialogHeader>

        {step === 'choose' ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ChoiceTile
                icon={FolderTree}
                title={t('categoryTree')}
                description={t('categoryTreeHint')}
                selected={choice === 'tree'}
                onClick={() => setChoice('tree')}
              />
              <ChoiceTile
                icon={FolderPlus}
                title={t('individualCategory')}
                description={t('individualCategoryHint')}
                selected={choice === 'individual'}
                onClick={() => setChoice('individual')}
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                {tCommon('cancel')}
              </Button>
              <Button type="button" disabled={!choice} onClick={() => setStep('form')}>
                {t('next')}
              </Button>
            </div>
          </div>
        ) : choice === 'tree' ? (
          <CategoryTreeForm
            categories={categories}
            assignProductIds={assignProductIds}
            onDone={() => handleOpenChange(false)}
            onCancel={() => handleOpenChange(false)}
          />
        ) : (
          <IndividualCategoryForm
            categories={categories}
            assignProductIds={assignProductIds}
            onDone={() => handleOpenChange(false)}
            onCancel={() => handleOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ChoiceTile({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: typeof FolderTree;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-3 rounded-xl border p-4 text-start transition-colors',
        selected ? 'border-brand bg-brand-muted' : 'border-zinc-200 hover:border-zinc-300',
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-lg bg-white text-zinc-400 shadow-sm">
        <Icon className="size-6" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-zinc-900">{title}</span>
        <span className="block text-xs text-zinc-500">{description}</span>
      </span>
    </button>
  );
}
