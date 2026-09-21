import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { LocationsPage } from '@/features/locations/components/locations-page';

export default async function SettingsLocationsPage() {
  await requirePermission(PERMISSIONS.SETTINGS_LOCATIONS_MANAGE);
  return <LocationsPage />;
}
