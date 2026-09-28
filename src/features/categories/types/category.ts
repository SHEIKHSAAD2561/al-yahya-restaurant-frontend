export interface Category {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  /** 1 = top-level, up to MAX_CATEGORY_DEPTH (3). */
  depth: number;
  /** Products filed directly under this category — not counting descendants'. */
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Mirrors al-yahya-restaurant-backend's CategoriesService — parent → child →
 * sub-child, no deeper. Enforced server-side too, this is just for the UI
 * to gate "+ Add sub-child" / the parent picker before round-tripping. */
export const MAX_CATEGORY_DEPTH = 3;

export interface CategoryTreeNodeInput {
  name: string;
  children?: CategoryTreeNodeInput[];
}
