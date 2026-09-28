import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { CategoryManagementPage } from '@/features/category-management/components/category-management-page';

export default async function CategoryManagementRoutePage() {
  await requirePermission(PERMISSIONS.PRODUCTS_MANAGE_CATEGORIES);
  return <CategoryManagementPage />;
}
