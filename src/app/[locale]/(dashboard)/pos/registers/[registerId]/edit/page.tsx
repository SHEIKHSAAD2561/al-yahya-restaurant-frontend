import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { RegisterFormPage } from '@/features/registers/components/register-form-page';

export default async function EditRegisterPage({ params }: { params: Promise<{ registerId: string }> }) {
  await requirePermission(PERMISSIONS.POS_ACCESS, PERMISSIONS.POS_MANAGE_SALE_SETTINGS);
  const { registerId } = await params;
  return <RegisterFormPage registerId={registerId} />;
}
