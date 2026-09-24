import { getTranslations } from 'next-intl/server';
import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { ComingSoon } from '@/components/layout/coming-soon';

export default async function SaleInvoicesPage() {
  await requirePermission(PERMISSIONS.POS_VIEW_SALE_INVOICES);
  const t = await getTranslations('nav');
  return <ComingSoon title={t('saleInvoices')} />;
}
