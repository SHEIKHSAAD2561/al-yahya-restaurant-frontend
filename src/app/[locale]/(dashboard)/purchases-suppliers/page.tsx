import { getTranslations } from 'next-intl/server';
import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { ComingSoon } from '@/components/layout/coming-soon';

export default async function PurchasesSuppliersPage() {
  await requirePermission(PERMISSIONS.PURCHASES_SUPPLIERS_ACCESS);
  const t = await getTranslations('nav');
  return <ComingSoon title={t('purchasesSuppliers')} />;
}
