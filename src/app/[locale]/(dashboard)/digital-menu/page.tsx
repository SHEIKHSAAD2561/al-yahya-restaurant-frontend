import { getTranslations } from 'next-intl/server';
import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { ComingSoon } from '@/components/layout/coming-soon';

export default async function DigitalMenuPage() {
  await requirePermission(PERMISSIONS.POS_MANAGE_DIGITAL_MENU);
  const t = await getTranslations('nav');
  return <ComingSoon title={t('digitalMenu')} />;
}
