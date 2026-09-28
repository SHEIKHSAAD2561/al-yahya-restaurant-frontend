import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { CloseRegisterPage } from '@/features/registers/components/close-register-page';

export default async function CloseRegisterRoutePage({ params }: { params: Promise<{ registerId: string }> }) {
  await requirePermission(PERMISSIONS.POS_ACCESS);
  const { registerId } = await params;
  return <CloseRegisterPage registerId={registerId} />;
}
