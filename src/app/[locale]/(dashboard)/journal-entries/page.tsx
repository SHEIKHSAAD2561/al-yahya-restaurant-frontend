import { requireAnyPermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { JournalEntriesPage } from '@/features/journal-entries/components/journal-entries-page';

export default async function JournalEntriesRoutePage() {
  await requireAnyPermission(PERMISSIONS.ACCOUNTING_RECORD_JOURNAL_ENTRIES, PERMISSIONS.ACCOUNTING_MANAGE_JOURNAL_ENTRIES);
  return <JournalEntriesPage />;
}
