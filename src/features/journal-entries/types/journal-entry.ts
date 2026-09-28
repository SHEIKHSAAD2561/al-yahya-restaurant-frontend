export const JOURNAL_ENTRY_STATUSES = { DRAFT: 'DRAFT', POSTED: 'POSTED' } as const;
export type JournalEntryStatus = (typeof JOURNAL_ENTRY_STATUSES)[keyof typeof JOURNAL_ENTRY_STATUSES];

export interface JournalEntryListItem {
  id: string;
  entryNumber: string | null;
  entryDate: string;
  memo: string | null;
  status: JournalEntryStatus;
  reversalOfEntryId: string | null;
  totalDebit: number;
  lineCount: number;
  createdAt: string;
}

export interface JournalEntryListPage {
  items: JournalEntryListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface JournalEntryLine {
  id: string;
  accountId: string;
  account?: { id: string; code: string; name: string };
  debit: number;
  credit: number;
  description: string | null;
}

export interface JournalEntry {
  id: string;
  entryNumber: string | null;
  entryDate: string;
  memo: string | null;
  status: JournalEntryStatus;
  reversalOfEntryId: string | null;
  lines: JournalEntryLine[];
  createdAt: string;
  updatedAt: string;
  postedAt: string | null;
}
