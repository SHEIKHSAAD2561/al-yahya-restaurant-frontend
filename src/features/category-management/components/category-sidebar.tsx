'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { buildCategoryTree, type CategoryTreeNode } from '@/features/categories/utils/category-tree';
import type { Category } from '@/features/categories/types/category';
import { CategoryTreeItem } from './category-tree-item';

export type SelectedBucket = { kind: 'uncategorized' } | { kind: 'category'; id: string };

interface CategorySidebarProps {
  categories: Category[];
  uncategorizedCount: number;
  selected: SelectedBucket;
  onSelect: (bucket: SelectedBucket) => void;
  onAdd: () => void;
}

function filterTree(nodes: CategoryTreeNode[], query: string): CategoryTreeNode[] {
  if (!query) return nodes;
  const lowerQuery = query.toLowerCase();
  const filterNode = (node: CategoryTreeNode): CategoryTreeNode | null => {
    const children = node.children.map(filterNode).filter((child): child is CategoryTreeNode => child !== null);
    if (node.name.toLowerCase().includes(lowerQuery) || children.length > 0) {
      return { ...node, children };
    }
    return null;
  };
  return nodes.map(filterNode).filter((node): node is CategoryTreeNode => node !== null);
}

export function CategorySidebar({ categories, uncategorizedCount, selected, onSelect, onAdd }: CategorySidebarProps) {
  const t = useTranslations('categoryManagement');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const tree = useMemo(() => buildCategoryTree(categories), [categories]);
  const visibleTree = useMemo(() => filterTree(tree, search.trim()), [tree, search]);

  function toggleExpand(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="w-72 shrink-0 space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('searchCategories')}
          className="ps-9"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-zinc-900">{t('categories')}</p>
          <button type="button" onClick={onAdd} className="text-sm font-medium text-brand hover:underline">
            {t('add')}
          </button>
        </div>

        <button
          type="button"
          onClick={() => onSelect({ kind: 'uncategorized' })}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-3 py-2 text-start text-sm transition-colors',
            selected.kind === 'uncategorized'
              ? 'border-s-2 border-red-500 bg-red-50 font-medium text-red-700'
              : 'text-zinc-700 hover:bg-zinc-50',
          )}
        >
          {uncategorizedCount > 0 && <AlertCircle className="size-4 shrink-0 text-red-500" />}
          <span className="flex-1 truncate">{t('uncategorized')}</span>
          <span className={cn('text-xs', selected.kind === 'uncategorized' ? 'text-red-600' : 'text-zinc-400')}>
            {uncategorizedCount}
          </span>
        </button>

        <div className="mt-1">
          {visibleTree.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-zinc-400">{t('noCategoriesYet')}</p>
          ) : (
            visibleTree.map((node) => (
              <CategoryTreeItem
                key={node.id}
                node={node}
                depth={0}
                selectedId={selected.kind === 'category' ? selected.id : null}
                expanded={search.trim() ? 'all' : expanded}
                onToggleExpand={toggleExpand}
                onSelect={(id) => onSelect({ kind: 'category', id })}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
