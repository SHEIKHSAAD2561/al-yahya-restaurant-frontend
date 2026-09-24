import { getTranslations } from 'next-intl/server';
import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { ComingSoon } from '@/components/layout/coming-soon';

export default async function StockTransferPage() {
  await requirePermission(PERMISSIONS.STOCK_REQUEST_TRANSFER);
  const t = await getTranslations('nav');
  return <ComingSoon title={t('stockTransfer')} />;
}
