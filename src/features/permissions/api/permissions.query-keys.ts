/** `locale` is part of the key because `description` is localized server-side
 * (from `x-lang`) — see roles.query-keys.ts for why this matters. */
export const permissionsKeys = {
  all: (locale: string) => ['permissions', locale] as const,
};
