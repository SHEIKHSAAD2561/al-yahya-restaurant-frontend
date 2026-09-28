import { requireAnyPermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { JournalEntryDetailPage } from '@/features/journal-entries/components/journal-entry-detail-page';

export default async function JournalEntryDetailRoutePage({ params }: { params: Promise<{ entryId: string }> }) {
  await requireAnyPermission(PERMISSIONS.ACCOUNTING_RECORD_JOURNAL_ENTRIES, PERMISSIONS.ACCOUNTING_MANAGE_JOURNAL_ENTRIES);
  const { entryId } = await params;
  return <JournalEntryDetailPage entryId={entryId} />;
}
