export const paymentMethodsKeys = {
  all: ['payment-methods'] as const,
  lists: () => [...paymentMethodsKeys.all, 'list'] as const,
};

export const bankAccountsKeys = {
  all: ['bank-accounts'] as const,
  lists: () => [...bankAccountsKeys.all, 'list'] as const,
};
