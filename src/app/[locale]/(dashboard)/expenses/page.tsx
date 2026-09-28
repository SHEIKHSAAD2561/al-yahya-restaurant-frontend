import { requirePermission } from '@/core/auth/permissions';
import { PERMISSIONS } from '@/core/permissions/codes';
import { ExpensesPage } from '@/features/expenses/components/expenses-page';

export default async function ExpensesRoutePage() {
  await requirePermission(PERMISSIONS.EXPENSES_ACCESS);
  return <ExpensesPage />;
}
