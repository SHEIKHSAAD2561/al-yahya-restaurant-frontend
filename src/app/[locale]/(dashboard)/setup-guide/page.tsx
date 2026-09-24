import { getTranslations } from 'next-intl/server';
import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { ComingSoon } from '@/components/layout/coming-soon';

export default async function SetupGuidePage() {
  await requirePermission(PERMISSIONS.ACCOUNTING_VIEW_SETUP_GUIDE);
  const t = await getTranslations('nav');
  return <ComingSoon title={t('setupGuide')} />;
}
