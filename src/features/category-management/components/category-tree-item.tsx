'use client';

import { ChevronRight, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CategoryTreeNode } from '@/features/categories/utils/category-tree';

interface CategoryTreeItemProps {
  node: CategoryTreeNode;
  depth: number;
  selectedId: string | null;
  /** Explicitly expanded ids, or "all" while a search is active. */
  expanded: Set<string> | 'all';
  onToggleExpand: (id: string) => void;
  onSelect: (id: string) => void;
}

export function CategoryTreeItem({ node, depth, selectedId, expanded, onToggleExpand, onSelect }: CategoryTreeItemProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expanded === 'all' || expanded.has(node.id);

  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(node.id)}
        style={{ paddingInlineStart: 12 + depth * 16 }}
        className={cn(
          'flex w-full items-center gap-1.5 rounded-md py-2 pe-3 text-start text-sm transition-colors',
          selectedId === node.id ? 'bg-brand-muted font-medium text-brand' : 'text-zinc-700 hover:bg-zinc-50',
        )}
      >
        {hasChildren ? (
          <span
            role="button"
            tabIndex={-1}
            onClick={(event) => {
              event.stopPropagation();
              onToggleExpand(node.id);
            }}
            className="flex size-4 shrink-0 items-center justify-center text-zinc-400"
          >
            <ChevronRight className={cn('size-3.5 transition-transform', isExpanded && 'rotate-90 rtl:-rotate-90')} />
          </span>
        ) : (
          <span className="size-4 shrink-0" />
        )}
        <Folder className="size-4 shrink-0 text-zinc-400" />
        <span className="flex-1 truncate">{node.name}</span>
        {node.productCount > 0 && <span className="text-xs text-zinc-400">{node.productCount}</span>}
      </button>
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <CategoryTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
