import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { OpenRegisterPage } from '@/features/registers/components/open-register-page';

export default async function OpenRegisterRoutePage({ params }: { params: Promise<{ registerId: string }> }) {
  await requirePermission(PERMISSIONS.POS_ACCESS);
  const { registerId } = await params;
  return <OpenRegisterPage registerId={registerId} />;
}
