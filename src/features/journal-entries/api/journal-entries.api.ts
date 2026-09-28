import { backendFetch } from '@/core/api/backend-fetch-client';
import type { JournalEntry, JournalEntryListPage, JournalEntryStatus } from '../types/journal-entry';

export interface JournalEntriesQuery {
  status?: JournalEntryStatus;
  accountId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface JournalEntryLineInput {
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface JournalEntryInput {
  entryDate: string;
  memo?: string;
  lines: JournalEntryLineInput[];
}

export const journalEntriesApi = {
  list: (query: JournalEntriesQuery = {}) =>
    backendFetch<JournalEntryListPage>('journal-entries', {
      searchParams: {
        status: query.status,
        accountId: query.accountId,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
        page: query.page?.toString(),
        pageSize: query.pageSize?.toString(),
      },
    }),
  get: (id: string) => backendFetch<JournalEntry>(`journal-entries/${id}`),
  create: (input: JournalEntryInput) => backendFetch<JournalEntry>('journal-entries', { method: 'POST', body: input }),
  update: (id: string, input: Partial<JournalEntryInput>) =>
    backendFetch<JournalEntry>(`journal-entries/${id}`, { method: 'PATCH', body: input }),
  post: (id: string) => backendFetch<JournalEntry>(`journal-entries/${id}/post`, { method: 'POST' }),
  reverse: (id: string) => backendFetch<JournalEntry>(`journal-entries/${id}/reverse`, { method: 'POST' }),
  remove: (id: string) => backendFetch<void>(`journal-entries/${id}`, { method: 'DELETE' }),
};
