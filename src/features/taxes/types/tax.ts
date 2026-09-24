import type { TaxType } from './tax-type';

export interface TaxLine {
  id: string;
  label: string | null;
  rate: number;
  sortOrder: number;
}

export interface Tax {
  id: string;
  name: string;
  code: string;
  type: TaxType;
  hasCompoundTax: boolean;
  compoundLabel: string | null;
  compoundRate: number | null;
  isActive: boolean;
  lines: TaxLine[];
  createdAt: string;
  updatedAt: string;
}
