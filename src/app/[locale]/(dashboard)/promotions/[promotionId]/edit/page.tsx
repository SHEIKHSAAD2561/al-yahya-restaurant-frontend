import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { PromotionEditPage } from '@/features/promotions/components/promotion-edit-page';

export default async function PromotionEditRoutePage({ params }: { params: Promise<{ promotionId: string }> }) {
  await requirePermission(PERMISSIONS.POS_MANAGE_PROMOTIONS);
  const { promotionId } = await params;
  return <PromotionEditPage promotionId={promotionId} />;
}
