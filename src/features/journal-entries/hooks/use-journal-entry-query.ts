'use client';

import { useQuery } from '@tanstack/react-query';
import { journalEntriesApi } from '../api/journal-entries.api';
import { journalEntriesKeys } from '../api/journal-entries.query-keys';

export function useJournalEntryQuery(id: string | undefined) {
  return useQuery({
    queryKey: journalEntriesKeys.detail(id ?? ''),
    queryFn: () => journalEntriesApi.get(id!),
    enabled: Boolean(id),
  });
}
