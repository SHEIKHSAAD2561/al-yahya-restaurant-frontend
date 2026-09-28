'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { expensesApi, type ExpensesQuery } from '../api/expenses.api';
import { expensesKeys } from '../api/expenses.query-keys';

export function useExpensesQuery(query: ExpensesQuery) {
  return useQuery({
    queryKey: expensesKeys.list(query),
    queryFn: () => expensesApi.list(query),
    placeholderData: keepPreviousData,
  });
}
