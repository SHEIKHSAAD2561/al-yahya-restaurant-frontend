import { getTranslations } from 'next-intl/server';
import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { ComingSoon } from '@/components/layout/coming-soon';

export default async function ChartOfAccountsPage() {
  await requirePermission(PERMISSIONS.ACCOUNTING_MANAGE_CHART_OF_ACCOUNTS);
  const t = await getTranslations('nav');
  return <ComingSoon title={t('chartOfAccounts')} />;
}
