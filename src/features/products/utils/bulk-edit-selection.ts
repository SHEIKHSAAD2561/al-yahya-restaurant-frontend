/** Passes the products-list checkbox selection to the /products/bulk-edit
 * page — sessionStorage rather than a query string, since a couple hundred
 * UUIDs would make the URL unwieldy. Per-tab and cleared once used, which
 * matches how this selection is meant to be used (pick rows, act on them). */

const STORAGE_KEY = 'products.bulkEditSelection';

export const MAX_BULK_EDIT_SELECTION = 200;

export interface BulkEditSelectionRow {
  variantId: string;
  productId: string;
}

export function saveBulkEditSelection(rows: BulkEditSelectionRow[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    // Private browsing / storage disabled — the bulk-edit page just opens empty.
  }
}

export function loadBulkEditSelection(): BulkEditSelectionRow[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BulkEditSelectionRow[]) : [];
  } catch {
    return [];
  }
}

export function clearBulkEditSelection(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore — nothing to clean up if storage never worked.
  }
}
