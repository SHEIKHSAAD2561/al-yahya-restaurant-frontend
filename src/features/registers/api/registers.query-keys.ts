export const registersKeys = {
  all: ['registers'] as const,
  lists: () => [...registersKeys.all, 'list'] as const,
  details: () => [...registersKeys.all, 'detail'] as const,
  detail: (id: string) => [...registersKeys.details(), id] as const,
  cashMovements: (id: string) => [...registersKeys.detail(id), 'cash-movements'] as const,
};
