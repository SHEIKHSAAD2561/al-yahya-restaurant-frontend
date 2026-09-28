'use client';

import { useEffect } from 'react';
import { QueryErrorState } from '@/components/ui/query-error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from '@/core/i18n/navigation';
import { useJournalEntryQuery } from '../hooks/use-journal-entry-query';
import { JournalEntryFormPage } from './journal-entry-form-page';

export function JournalEntryEditPage({ entryId }: { entryId: string }) {
  const router = useRouter();
  const entryQuery = useJournalEntryQuery(entryId);
  const isNotDraft = entryQuery.data && entryQuery.data.status !== 'DRAFT';

  useEffect(() => {
    if (isNotDraft) router.replace(`/journal-entries/${entryId}`);
  }, [isNotDraft, entryId, router]);

  if (entryQuery.isPending || isNotDraft) return <Skeleton className="h-96 w-full" />;
  if (entryQuery.isError || !entryQuery.data) {
    return <QueryErrorState onRetry={() => void entryQuery.refetch()} />;
  }

  return <JournalEntryFormPage key={entryQuery.data.updatedAt} entry={entryQuery.data} />;
}
