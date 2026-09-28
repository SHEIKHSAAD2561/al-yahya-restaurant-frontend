/** Client-side counterpart to the backend's csv.util.ts — just enough to
 * build the import template file (no parsing needed here). */
export function toCsvRow(cells: string[]): string {
  return cells.map((cell) => (/[",\r\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell)).join(',');
}
