import { getTranslations } from 'next-intl/server';
import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { ComingSoon } from '@/components/layout/coming-soon';

export default async function JournalEntriesPage() {
  await requirePermission(PERMISSIONS.ACCOUNTING_RECORD_JOURNAL_ENTRIES);
  const t = await getTranslations('nav');
  return <ComingSoon title={t('journalEntries')} />;
}
