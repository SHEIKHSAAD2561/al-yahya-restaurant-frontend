import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { ReturnInvoiceFormPage } from '@/features/return-invoices/components/return-invoice-form-page';

export default async function NewReturnInvoiceRoutePage() {
  await requirePermission(PERMISSIONS.PURCHASES_SUPPLIERS_RECORD_RETURNS);
  return <ReturnInvoiceFormPage />;
}
