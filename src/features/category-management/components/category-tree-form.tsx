'use client';

import { useState } from 'react';
import { Folder, FolderOpen, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateCategoryTreeMutation } from '@/features/categories/hooks/use-create-category-tree-mutation';
import { useAssignProductsMutation } from '@/features/categories/hooks/use-assign-products-mutation';
import type { Category } from '@/features/categories/types/category';

interface SubChildDraft {
  key: string;
  name: string;
}
interface ChildDraft {
  key: string;
  name: string;
  subChildren: SubChildDraft[];
}

const newKey = () => (typeof crypto !== 'undefined' ? crypto.randomUUID() : String(Math.random()));

interface CategoryTreeFormProps {
  categories: Category[];
  assignProductIds: string[];
  onDone: () => void;
  onCancel: () => void;
}

/**
 * Fixed at 3 levels (parent → child → sub-child), matching what this dialog
 * actually offers ("+ Add child category" only appears at the parent level,
 * "+ Add sub-child" only at the child level) — not a generic depth-N tree
 * builder, even though the backend (`POST /categories/tree`) accepts one.
 */
export function CategoryTreeForm({ categories, assignProductIds, onDone, onCancel }: CategoryTreeFormProps) {
  const t = useTranslations('categoryManagement');
  const tCommon = useTranslations('common');
  const createTreeMutation = useCreateCategoryTreeMutation();
  const { assign } = useAssignProductsMutation();

  const [parentName, setParentName] = useState('');
  const [children, setChildren] = useState<ChildDraft[]>([]);
  const topLevelNames = categories.filter((category) => category.depth === 1).map((category) => category.name);

  function addChild() {
    setChildren((current) => [...current, { key: newKey(), name: '', subChildren: [] }]);
  }
  function updateChild(key: string, name: string) {
    setChildren((current) => current.map((child) => (child.key === key ? { ...child, name } : child)));
  }
  function removeChild(key: string) {
    setChildren((current) => current.filter((child) => child.key !== key));
  }
  function addSubChild(childKey: string) {
    setChildren((current) =>
      current.map((child) =>
        child.key === childKey
          ? { ...child, subChildren: [...child.subChildren, { key: newKey(), name: '' }] }
          : child,
      ),
    );
  }
  function updateSubChild(childKey: string, subKey: string, name: string) {
    setChildren((current) =>
      current.map((child) =>
        child.key === childKey
          ? { ...child, subChildren: child.subChildren.map((sub) => (sub.key === subKey ? { ...sub, name } : sub)) }
          : child,
      ),
    );
  }
  function removeSubChild(childKey: string, subKey: string) {
    setChildren((current) =>
      current.map((child) =>
        child.key === childKey
          ? { ...child, subChildren: child.subChildren.filter((sub) => sub.key !== subKey) }
          : child,
      ),
    );
  }

  function handleSubmit() {
    createTreeMutation.mutate(
      {
        parentName: parentName.trim(),
        children: children
          .filter((child) => child.name.trim())
          .map((child) => ({
            name: child.name.trim(),
            children: child.subChildren.filter((sub) => sub.name.trim()).map((sub) => ({ name: sub.name.trim() })),
          })),
      },
      {
        onSuccess: (parent) => {
          if (assignProductIds.length > 0) {
            assign.mutate({ categoryId: parent.id, productIds: assignProductIds });
          }
          onDone();
        },
      },
    );
  }

  const isPending = createTreeMutation.isPending || assign.isPending;

  return (
    <div className="grid gap-6 sm:grid-cols-[1fr_14rem]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900">
            <Folder className="size-4 text-zinc-400" />
            {t('parentCategoryLabel')}
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="treeParentName">
            <span className="text-red-600">*</span> {t('categoryName')}
          </Label>
          <Input
            id="treeParentName"
            list="existing-top-level-categories"
            placeholder={t('selectPlaceholder')}
            value={parentName}
            maxLength={100}
            onChange={(event) => setParentName(event.target.value)}
          />
          <datalist id="existing-top-level-categories">
            {topLevelNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          <p className="text-xs text-zinc-400">{t('parentNameHint')}</p>
        </div>

        {children.map((child) => (
          <div key={child.key} className="rounded-lg border border-zinc-200 bg-zinc-50/60 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-sm font-medium text-zinc-900">
                <FolderOpen className="size-4 text-emerald-600" />
                {t('childCategoryLabel')}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => addSubChild(child.key)}
                  className="flex items-center gap-1 text-sm font-medium text-brand"
                >
                  <Plus className="size-3.5" />
                  {t('addSubChild')}
                </button>
                <button type="button" onClick={() => removeChild(child.key)} aria-label={t('removeCategory')}>
                  <Trash2 className="size-4 text-red-500" />
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`child-${child.key}`}>
                <span className="text-red-600">*</span> {t('categoryName')}
              </Label>
              <Input
                id={`child-${child.key}`}
                value={child.name}
                maxLength={100}
                onChange={(event) => updateChild(child.key, event.target.value)}
              />
            </div>

            {child.subChildren.map((sub) => (
              <div key={sub.key} className="mt-3 border-t border-zinc-200 pt-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-zinc-700">
                    <Folder className="size-4 text-zinc-400" />
                    {t('subChildCategoryLabel')}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeSubChild(child.key, sub.key)}
                    aria-label={t('removeCategory')}
                  >
                    <Trash2 className="size-4 text-red-500" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`sub-${sub.key}`}>
                    <span className="text-red-600">*</span> {t('categoryName')}
                  </Label>
                  <Input
                    id={`sub-${sub.key}`}
                    value={sub.name}
                    maxLength={100}
                    onChange={(event) => updateSubChild(child.key, sub.key, event.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}

        <button type="button" onClick={addChild} className="flex items-center gap-1.5 text-sm font-medium text-brand">
          <Plus className="size-4" />
          {t('addChildCategory')}
        </button>

        <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            {tCommon('cancel')}
          </Button>
          <Button type="button" disabled={!parentName.trim() || isPending} onClick={handleSubmit}>
            {tCommon('save')}
          </Button>
        </div>
      </div>

      <div className="border-s border-zinc-100 ps-6">
        <p className="mb-3 text-sm font-semibold text-zinc-900">{t('preview')}</p>
        {!parentName.trim() ? (
          <p className="text-xs text-zinc-400">{t('previewEmpty')}</p>
        ) : (
          <TreePreviewNode label={parentName}>
            {children
              .filter((child) => child.name.trim())
              .map((child) => (
                <TreePreviewNode key={child.key} label={child.name}>
                  {child.subChildren
                    .filter((sub) => sub.name.trim())
                    .map((sub) => (
                      <TreePreviewNode key={sub.key} label={sub.name} />
                    ))}
                </TreePreviewNode>
              ))}
          </TreePreviewNode>
        )}
      </div>
    </div>
  );
}

function TreePreviewNode({ label, children }: { label: string; children?: React.ReactNode }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <div>
      <span className="inline-block rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-800 shadow-sm">
        {label}
      </span>
      {hasChildren && <div className="ms-3 space-y-1.5 border-s border-zinc-200 ps-3 pt-1.5">{children}</div>}
    </div>
  );
}
