export const EXPENSE_CATEGORIES = {
  RENT: 'RENT',
  SALARIES: 'SALARIES',
  UTILITIES: 'UTILITIES',
  OTHER: 'OTHER',
} as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[keyof typeof EXPENSE_CATEGORIES];

export interface ExpenseListItem {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  locationId: string | null;
  locationName: string | null;
  expenseDate: string;
  createdByName: string;
  createdAt: string;
}

export interface ExpenseListPage {
  items: ExpenseListItem[];
  total: number;
  page: number;
  pageSize: number;
}
