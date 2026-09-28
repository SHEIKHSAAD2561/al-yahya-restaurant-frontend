import { backendFetch } from '@/core/api/backend-fetch-client';
import type { ExpenseCategory, ExpenseListItem, ExpenseListPage } from '../types/expense';

export interface ExpensesQuery {
  dateFrom?: string;
  dateTo?: string;
  category?: ExpenseCategory;
  locationId?: string;
  page?: number;
  pageSize?: number;
}

export interface ExpenseInput {
  category: ExpenseCategory;
  description: string;
  amount: number;
  locationId?: string | null;
  expenseDate: string;
}

export const expensesApi = {
  list: (query: ExpensesQuery = {}) =>
    backendFetch<ExpenseListPage>('expenses', {
      searchParams: {
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
        category: query.category,
        locationId: query.locationId,
        page: query.page?.toString(),
        pageSize: query.pageSize?.toString(),
      },
    }),
  get: (id: string) => backendFetch<ExpenseListItem>(`expenses/${id}`),
  create: (input: ExpenseInput) => backendFetch<ExpenseListItem>('expenses', { method: 'POST', body: input }),
  update: (id: string, input: Partial<ExpenseInput>) =>
    backendFetch<ExpenseListItem>(`expenses/${id}`, { method: 'PATCH', body: input }),
  remove: (id: string) => backendFetch<void>(`expenses/${id}`, { method: 'DELETE' }),
};
