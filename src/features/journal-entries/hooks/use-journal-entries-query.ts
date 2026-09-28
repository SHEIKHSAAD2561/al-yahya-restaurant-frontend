'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { journalEntriesApi, type JournalEntriesQuery } from '../api/journal-entries.api';
import { journalEntriesKeys } from '../api/journal-entries.query-keys';

export function useJournalEntriesQuery(query: JournalEntriesQuery) {
  return useQuery({
    queryKey: journalEntriesKeys.list(query),
    queryFn: () => journalEntriesApi.list(query),
    placeholderData: keepPreviousData,
  });
}
