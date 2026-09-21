'use client';

import { MoreHorizontal, Pencil, Trash2, MapPin, Star } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTranslations } from 'next-intl';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useSetDefaultLocationMutation } from '../hooks/use-set-default-location-mutation';
import { useDeleteLocationMutation } from '../hooks/use-delete-location-mutation';
import type { Location } from '../types/location';

interface LocationListTableProps {
  locations: Location[];
  isLoading: boolean;
  onEdit: (location: Location) => void;
}

export function LocationListTable({ locations, isLoading, onEdit }: LocationListTableProps) {
  const t = useTranslations('settings.locations');
  const tCommon = useTranslations('common');
  const setDefaultMutation = useSetDefaultLocationMutation();
  const deleteMutation = useDeleteLocationMutation();

  if (isLoading) {
    return (
      <Table>
        <TableBody>
          {Array.from({ length: 3 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell colSpan={4}>
                <Skeleton className="h-6 w-full" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (locations.length === 0) {
    return (
      <Table>
        <TableBody>
          <TableRow>
            <TableCell colSpan={4} className="p-0">
              <EmptyState icon={MapPin} title={tCommon('noResults')} />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeaderCell>{t('name')}</TableHeaderCell>
          <TableHeaderCell>{t('address')}</TableHeaderCell>
          <TableHeaderCell>{tCommon('active')}</TableHeaderCell>
          <TableHeaderCell className="w-10" />
        </tr>
      </TableHead>
      <TableBody>
        {locations.map((location) => (
          <TableRow key={location.id}>
            <TableCell>
              <div className="flex items-center gap-2 font-medium text-zinc-900">
                {location.isDefault && <Star className="size-3.5 fill-accent text-accent" />}
                {location.name}
              </div>
              {location.isDefault && (
                <Badge variant="brand" className="mt-1">
                  {t('defaultBadge')}
                </Badge>
              )}
            </TableCell>
            <TableCell>{location.address || '—'}</TableCell>
            <TableCell>
              <Badge variant={location.isActive ? 'success' : 'neutral'}>
                {location.isActive ? tCommon('active') : tCommon('inactive')}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                    aria-label="Row actions"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={6}
                    className="z-50 min-w-44 rounded-lg border border-zinc-200 bg-white p-1 shadow-md"
                  >
                    <DropdownMenu.Item
                      onSelect={() => onEdit(location)}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100 data-[highlighted]:bg-zinc-100"
                    >
                      <Pencil className="size-4" />
                      {tCommon('edit')}
                    </DropdownMenu.Item>
                    {!location.isDefault && (
                      <DropdownMenu.Item
                        onSelect={() => setDefaultMutation.mutate(location.id)}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 outline-none hover:bg-zinc-100 data-[highlighted]:bg-zinc-100"
                      >
                        <Star className="size-4" />
                        {t('setDefault')}
                      </DropdownMenu.Item>
                    )}
                    {!location.isDefault && (
                      <DropdownMenu.Item
                        onSelect={() => {
                          if (window.confirm(t('confirmDelete'))) {
                            deleteMutation.mutate(location.id);
                          }
                        }}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50 data-[highlighted]:bg-red-50"
                      >
                        <Trash2 className="size-4" />
                        {tCommon('delete')}
                      </DropdownMenu.Item>
                    )}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
