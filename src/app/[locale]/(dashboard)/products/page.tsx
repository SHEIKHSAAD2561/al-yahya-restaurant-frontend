import { getTranslations } from 'next-intl/server';
import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { ComingSoon } from '@/components/layout/coming-soon';

export default async function ProductsPage() {
  await requirePermission(PERMISSIONS.PRODUCTS_ACCESS);
  const t = await getTranslations('nav');
  return <ComingSoon title={t('products')} />;
}
