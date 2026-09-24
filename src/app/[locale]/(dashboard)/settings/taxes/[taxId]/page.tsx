import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { TaxFormPage } from '@/features/taxes/components/tax-form-page';

export default async function EditTaxPage({ params }: { params: Promise<{ taxId: string }> }) {
  await requirePermission(PERMISSIONS.SETTINGS_FINANCIAL_SETTINGS);
  const { taxId } = await params;
  return <TaxFormPage taxId={taxId} />;
}
