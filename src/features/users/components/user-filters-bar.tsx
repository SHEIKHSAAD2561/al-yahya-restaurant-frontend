'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import type { Role } from '@/features/roles/types/role';
import { USER_STATUSES } from '../types/user';
import type { UsersQuery } from '../api/users.api';

interface UserFiltersBarProps {
  filters: UsersQuery;
  onChange: (filters: UsersQuery) => void;
  roles: Role[];
}

const ALL = '__all__';

export function UserFiltersBar({ filters, onChange, roles }: UserFiltersBarProps) {
  const t = useTranslations('settings.users');
  const tCommon = useTranslations('common');

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-48 flex-1">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
        <Input
          className="ps-9"
          placeholder={t('searchPlaceholder')}
          value={filters.search ?? ''}
          onChange={(event) => onChange({ ...filters, search: event.target.value || undefined })}
        />
      </div>

      <Select
        value={filters.roleId ?? ALL}
        onValueChange={(value) =>
          onChange({ ...filters, roleId: value === ALL ? undefined : value })
        }
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder={t('allRoles')}>
            {filters.roleId ? roles.find((role) => role.id === filters.roleId)?.name : t('allRoles')}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t('allRoles')}</SelectItem>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.id}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status ?? ALL}
        onValueChange={(value) =>
          onChange({ ...filters, status: value === ALL ? undefined : (value as UsersQuery['status']) })
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder={t('allStatuses')}>
            {filters.status ? tCommon(filters.status.toLowerCase() as 'active' | 'pending' | 'inactive') : t('allStatuses')}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t('allStatuses')}</SelectItem>
          <SelectItem value={USER_STATUSES.ACTIVE}>{tCommon('active')}</SelectItem>
          <SelectItem value={USER_STATUSES.PENDING}>{tCommon('pending')}</SelectItem>
          <SelectItem value={USER_STATUSES.INACTIVE}>{tCommon('inactive')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
