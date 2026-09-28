import type { ExpensesQuery } from './expenses.api';

export const expensesKeys = {
  all: ['expenses'] as const,
  lists: () => [...expensesKeys.all, 'list'] as const,
  list: (query: ExpensesQuery) => [...expensesKeys.lists(), query] as const,
};
