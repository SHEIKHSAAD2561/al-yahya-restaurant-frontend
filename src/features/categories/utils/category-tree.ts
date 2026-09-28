import type { Category } from '../types/category';

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

/** Builds a nested tree from the flat, parentId-pointing list the API
 * returns — used by Category Management's sidebar. A node whose parent
 * wasn't found (shouldn't happen, but data can be mid-migration) is treated
 * as a root rather than silently dropped. */
export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const byId = new Map<string, CategoryTreeNode>(
    categories.map((category) => [category.id, { ...category, children: [] }]),
  );
  const roots: CategoryTreeNode[] = [];
  for (const category of categories) {
    const node = byId.get(category.id)!;
    const parent = category.parentId ? byId.get(category.parentId) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export function categoryById(categories: Category[]): Map<string, Category> {
  return new Map(categories.map((category) => [category.id, category]));
}

/** "Cakes / Small Cake" — used wherever a category needs to be identifiable
 * out of context (the product form's flat Classification dropdown). */
export function categoryPath(category: Category, byId: Map<string, Category>): string {
  const parts = [category.name];
  let current = category;
  while (current.parentId) {
    const parent = byId.get(current.parentId);
    if (!parent) break;
    parts.unshift(parent.name);
    current = parent;
  }
  return parts.join(' / ');
}
