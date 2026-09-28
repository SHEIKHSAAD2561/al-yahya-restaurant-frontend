import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { PromotionNewPage } from '@/features/promotions/components/promotion-new-page';

export default async function PromotionNewRoutePage() {
  await requirePermission(PERMISSIONS.POS_MANAGE_PROMOTIONS);
  return <PromotionNewPage />;
}
