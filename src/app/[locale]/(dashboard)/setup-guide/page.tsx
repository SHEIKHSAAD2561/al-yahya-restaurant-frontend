import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { SetupGuidePage } from '@/features/accounting-overview/components/setup-guide-page';

export default async function SetupGuideRoutePage() {
  await requirePermission(PERMISSIONS.ACCOUNTING_VIEW_SETUP_GUIDE);
  return <SetupGuidePage />;
}
