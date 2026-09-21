import { RoleCard } from './role-card';
import type { Role } from '../types/role';

interface RoleCardGridProps {
  roles: Role[];
  canDelete: boolean;
  onView: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export function RoleCardGrid({ roles, canDelete, onView, onDelete }: RoleCardGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {roles.map((role) => (
        <RoleCard key={role.id} role={role} canDelete={canDelete} onView={onView} onDelete={onDelete} />
      ))}
    </div>
  );
}
