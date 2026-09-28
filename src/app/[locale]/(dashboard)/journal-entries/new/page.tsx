import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { JournalEntryFormPage } from '@/features/journal-entries/components/journal-entry-form-page';

export default async function NewJournalEntryRoutePage() {
  await requirePermission(PERMISSIONS.ACCOUNTING_RECORD_JOURNAL_ENTRIES);
  return <JournalEntryFormPage />;
}
