import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { SellScreen } from '@/features/sales/components/sell-screen';

export default async function RegisterSellScreenPage({ params }: { params: Promise<{ registerId: string }> }) {
  await requirePermission(PERMISSIONS.POS_ACCESS);
  const { registerId } = await params;
  return <SellScreen registerId={registerId} />;
}
