import { getTranslations } from 'next-intl/server';
import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { ComingSoon } from '@/components/layout/coming-soon';

export default async function ModifiersPage() {
  await requirePermission(PERMISSIONS.PRODUCTS_MANAGE_MODIFIERS);
  const t = await getTranslations('nav');
  return <ComingSoon title={t('modifiers')} />;
}
