import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { FixedAssetsPage } from '@/features/fixed-assets/components/fixed-assets-page';

export default async function FixedAssetsRoutePage() {
  await requirePermission(PERMISSIONS.ACCOUNTING_MANAGE_FIXED_ASSETS);
  return <FixedAssetsPage />;
}
