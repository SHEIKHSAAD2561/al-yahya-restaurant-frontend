export const configurationKeys = {
  all: ['configuration'] as const,
  detail: () => [...configurationKeys.all, 'detail'] as const,
  locationOptions: () => [...configurationKeys.all, 'location-options'] as const,
};
