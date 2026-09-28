import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { PaymentMethodsPage } from '@/features/payment-methods/components/payment-methods-page';

export default async function SettingsPaymentMethodsPage() {
  await requirePermission(PERMISSIONS.SETTINGS_FINANCIAL_SETTINGS);
  return <PaymentMethodsPage />;
}
