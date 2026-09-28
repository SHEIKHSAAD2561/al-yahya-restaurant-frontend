export const categoriesKeys = {
  all: ['categories'] as const,
  lists: () => [...categoriesKeys.all, 'list'] as const,
  uncategorizedCount: () => [...categoriesKeys.all, 'uncategorized-count'] as const,
};
