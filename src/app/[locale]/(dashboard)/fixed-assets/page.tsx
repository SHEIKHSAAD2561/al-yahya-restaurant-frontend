import { getTranslations } from 'next-intl/server';
import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { ComingSoon } from '@/components/layout/coming-soon';

export default async function FixedAssetsPage() {
  await requirePermission(PERMISSIONS.ACCOUNTING_MANAGE_FIXED_ASSETS);
  const t = await getTranslations('nav');
  return <ComingSoon title={t('fixedAssets')} />;
}
