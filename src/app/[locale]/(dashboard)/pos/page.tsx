import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { RegistersPage } from '@/features/registers/components/registers-page';

export default async function PosPage() {
  await requirePermission(PERMISSIONS.POS_ACCESS);
  return <RegistersPage />;
}
