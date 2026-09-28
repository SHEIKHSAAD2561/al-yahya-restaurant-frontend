import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { ConfigurationPage } from '@/features/configuration/components/configuration-page';

export default async function SettingsConfigurationPage() {
  await requirePermission(PERMISSIONS.SETTINGS_FINANCIAL_SETTINGS);
  return <ConfigurationPage />;
}
