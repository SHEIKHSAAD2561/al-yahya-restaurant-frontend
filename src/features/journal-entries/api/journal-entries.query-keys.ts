import type { JournalEntriesQuery } from './journal-entries.api';

export const journalEntriesKeys = {
  all: ['journal-entries'] as const,
  lists: () => [...journalEntriesKeys.all, 'list'] as const,
  list: (query: JournalEntriesQuery) => [...journalEntriesKeys.lists(), query] as const,
  details: () => [...journalEntriesKeys.all, 'detail'] as const,
  detail: (id: string) => [...journalEntriesKeys.details(), id] as const,
};
