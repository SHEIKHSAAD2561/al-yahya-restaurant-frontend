import { requireAnyPermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { JournalEntryEditPage } from '@/features/journal-entries/components/journal-entry-edit-page';

export default async function JournalEntryEditRoutePage({ params }: { params: Promise<{ entryId: string }> }) {
  await requireAnyPermission(PERMISSIONS.ACCOUNTING_RECORD_JOURNAL_ENTRIES, PERMISSIONS.ACCOUNTING_MANAGE_JOURNAL_ENTRIES);
  const { entryId } = await params;
  return <JournalEntryEditPage entryId={entryId} />;
}
