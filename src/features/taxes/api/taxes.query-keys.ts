export const taxesKeys = {
  all: ['taxes'] as const,
  lists: () => [...taxesKeys.all, 'list'] as const,
  detail: (id: string) => [...taxesKeys.all, 'detail', id] as const,
};
