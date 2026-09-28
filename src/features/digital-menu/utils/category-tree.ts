import type { DigitalMenuCategory } from '@/core/digital-menu/get-digital-menu';

export interface MenuCategoryNode {
  id: string;
  name: string;
  children: MenuCategoryNode[];
}

/** Only 2 levels are surfaced in the menu's nav (top-level pill + its direct
 * children shown as a sub-row once selected) even though a category can be
 * up to 3 levels deep in Category Management — a customer-facing menu nav
 * doesn't need a full parent/child/sub-child picker, a deliberate
 * simplification for readability on a phone screen. */
export function buildMenuCategoryTree(categories: DigitalMenuCategory[]): MenuCategoryNode[] {
  const byId = new Map<string, MenuCategoryNode>(
    categories.map((category) => [category.id, { id: category.id, name: category.name, children: [] }]),
  );
  const roots: MenuCategoryNode[] = [];
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

/** This category's id plus every descendant's id — selecting a top-level
 * category on the menu shows its own products and every sub-category's too. */
export function categoryAndDescendantIds(node: MenuCategoryNode): Set<string> {
  const ids = new Set<string>([node.id]);
  for (const child of node.children) {
    for (const id of categoryAndDescendantIds(child)) ids.add(id);
  }
  return ids;
}
