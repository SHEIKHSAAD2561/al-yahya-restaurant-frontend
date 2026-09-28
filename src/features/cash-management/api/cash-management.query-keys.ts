import type { SessionsQuery } from './cash-management.api';

export const cashManagementKeys = {
  all: ['cash-management-sessions'] as const,
  lists: () => [...cashManagementKeys.all, 'list'] as const,
  list: (query: SessionsQuery) => [...cashManagementKeys.lists(), query] as const,
  details: () => [...cashManagementKeys.all, 'detail'] as const,
  detail: (id: string) => [...cashManagementKeys.details(), id] as const,
  movements: (id: string) => [...cashManagementKeys.all, 'movements', id] as const,
};
