/**
 * `locale` is part of every key here because `name`/`description` are
 * localized server-side (from `x-lang`) — without it, switching language
 * wouldn't invalidate the English response already cached under the same
 * key, and the UI would keep showing stale-language text until a hard
 * refresh (a real bug we hit).
 */
export const rolesKeys = {
  all: ['roles'] as const,
  lists: (locale: string) => [...rolesKeys.all, 'list', locale] as const,
  details: () => [...rolesKeys.all, 'detail'] as const,
  detail: (id: string, locale: string) => [...rolesKeys.details(), id, locale] as const,
};
