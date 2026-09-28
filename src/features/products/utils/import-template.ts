import { toCsvRow } from '@/lib/csv';

/** Column labels the backend's importer looks for (case-insensitively) —
 * keep in sync with al-yahya-restaurant-backend's ProductsService.importCsv().
 * SIMPLE products only, matching that same limitation on the backend. */
const TEMPLATE_HEADER = [
  'Product Name',
  'SKU',
  'Barcode',
  'Description',
  'Category',
  'Tax',
  'Retail Price',
  'Wholesale Price',
  'Buy Price',
  'Initial Quantity',
  'Reorder Point',
  'Sellable',
  'Purchasable',
  'Weighted',
];

const TEMPLATE_EXAMPLE_ROW = [
  'Bottled Water 500ml',
  'WATER-500',
  '',
  'Chilled bottled water',
  '',
  '',
  '3.50',
  '3.00',
  '1.80',
  '50',
  '10',
  'true',
  'true',
  'false',
];

export function buildImportTemplateCsv(): Blob {
  const text = '﻿' + [TEMPLATE_HEADER, TEMPLATE_EXAMPLE_ROW].map(toCsvRow).join('\r\n');
  return new Blob([text], { type: 'text/csv;charset=utf-8' });
}
