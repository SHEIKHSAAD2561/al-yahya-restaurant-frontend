export const brandsKeys = {
  all: ['brands'] as const,
  lists: () => [...brandsKeys.all, 'list'] as const,
};
