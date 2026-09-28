import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { RegisterFormPage } from '@/features/registers/components/register-form-page';

export default async function NewRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ locationId?: string }>;
}) {
  await requirePermission(PERMISSIONS.POS_ACCESS, PERMISSIONS.POS_MANAGE_SALE_SETTINGS);
  const { locationId } = await searchParams;
  return <RegisterFormPage locationId={locationId} />;
}
