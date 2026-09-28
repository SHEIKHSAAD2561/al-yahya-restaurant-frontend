import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { PromotionsPage } from '@/features/promotions/components/promotions-page';

export default async function PromotionsRoutePage() {
  await requirePermission(PERMISSIONS.POS_MANAGE_PROMOTIONS);
  return <PromotionsPage />;
}
