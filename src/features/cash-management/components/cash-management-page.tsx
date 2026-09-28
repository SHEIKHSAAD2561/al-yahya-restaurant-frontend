'use client';

import { useState } from 'react';
import { Upload, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { useLocationsQuery } from '@/features/locations/hooks/use-locations-query';
import { useRegistersQuery } from '@/features/registers/hooks/use-registers-query';
import type { SessionStatus } from '../types/session';
import { useSessionsQuery } from '../hooks/use-sessions-query';
import { useExportSessionsMutation } from '../hooks/use-export-sessions-mutation';
import { SessionDetailSheet } from './session-detail-sheet';

const ALL = 'ALL';

function StatusBadge({ status }: { status: SessionStatus }) {
  const t = useTranslations('cashManagement');
  if (status === 'OPEN') return <Badge variant="brand">{t('statusOpen')}</Badge>;
  if (status === 'BALANCED') return <Badge variant="success">{t('statusBalanced')}</Badge>;
  return <Badge variant="danger">{t('statusUnbalanced')}</Badge>;
}

export function CashManagementPage() {
  const t = useTranslations('cashManagement');
  const tCommon = useTranslations('common');
  const locationsQuery = useLocationsQuery();
  const registersQuery = useRegistersQuery();
  const exportMutation = useExportSessionsMutation();

  const [locationId, setLocationId] = useState(ALL);
  const [registerId, setRegisterId] = useState(ALL);
  const [status, setStatus] = useState<SessionStatus | typeof ALL>(ALL);
  const [pageSize, setPageSize] = useState('10');
  const [page, setPage] = useState(0);
  const [viewingSessionId, setViewingSessionId] = useState<string | null>(null);

  const query = {
    locationId: locationId === ALL ? undefined : locationId,
    registerId: registerId === ALL ? undefined : registerId,
    status: status === ALL ? undefined : status,
    page: page + 1,
    pageSize: Number(pageSize),
  };
  const sessionsQuery = useSessionsQuery(query);

  const registers = (registersQuery.data ?? []).flatMap((group) => group.registers);
  const items = sessionsQuery.data?.items ?? [];
  const total = sessionsQuery.data?.total ?? 0;
  const size = Number(pageSize);
  const pageCount = Math.max(1, Math.ceil(total / size));

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(0);
    };
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Select value={locationId} onValueChange={resetPage(setLocationId)}>
            <SelectTrigger className="w-48">
              <SelectValue>
                {locationId === ALL ? t('allLocations') : locationsQuery.data?.find((l) => l.id === locationId)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('allLocations')}</SelectItem>
              {(locationsQuery.data ?? []).map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={registerId} onValueChange={resetPage(setRegisterId)}>
            <SelectTrigger className="w-48">
              <SelectValue>
                {registerId === ALL ? t('allRegisters') : registers.find((r) => r.id === registerId)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('allRegisters')}</SelectItem>
              {registers.map((register) => (
                <SelectItem key={register.id} value={register.id}>
                  {register.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={(value) => resetPage(setStatus)(value as SessionStatus | typeof ALL)}>
            <SelectTrigger className="w-40">
              <SelectValue>
                {status === ALL
                  ? t('allStatuses')
                  : status === 'OPEN'
                    ? t('statusOpen')
                    : status === 'BALANCED'
                      ? t('statusBalanced')
                      : t('statusUnbalanced')}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('allStatuses')}</SelectItem>
              <SelectItem value="OPEN">{t('statusOpen')}</SelectItem>
              <SelectItem value="BALANCED">{t('statusBalanced')}</SelectItem>
              <SelectItem value="UNBALANCED">{t('statusUnbalanced')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" disabled={exportMutation.isPending} onClick={() => exportMutation.mutate(query)}>
          <Upload className="size-4" />
          {t('export')}
        </Button>
      </div>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>{t('location')}</TableHeaderCell>
            <TableHeaderCell>{t('registerName')}</TableHeaderCell>
            <TableHeaderCell>{t('openedBy')}</TableHeaderCell>
            <TableHeaderCell>{t('openDate')}</TableHeaderCell>
            <TableHeaderCell>{t('closeDate')}</TableHeaderCell>
            <TableHeaderCell>{t('status')}</TableHeaderCell>
            <TableHeaderCell className="w-16" />
          </tr>
        </TableHead>
        <TableBody>
          {sessionsQuery.isPending ? (
            Array.from({ length: 4 }, (_, index) => (
              <TableRow key={index}>
                <TableCell colSpan={7}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="p-0">
                <EmptyState icon={Wallet} title={tCommon('noResults')} />
              </TableCell>
            </TableRow>
          ) : (
            items.map((session) => (
              <TableRow
                key={session.id}
                className="cursor-pointer"
                onClick={() => setViewingSessionId(session.id)}
              >
                <TableCell>{session.locationName}</TableCell>
                <TableCell className="font-medium text-zinc-900">{session.registerName}</TableCell>
                <TableCell>{session.openedByName}</TableCell>
                <TableCell>{new Date(session.openedAt).toLocaleString()}</TableCell>
                <TableCell>{session.closedAt ? new Date(session.closedAt).toLocaleString() : '—'}</TableCell>
                <TableCell>
                  <StatusBadge status={session.status} />
                </TableCell>
                <TableCell />
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={Math.min(page, pageCount - 1)}
        pageCount={pageCount}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={resetPage(setPageSize)}
        pageSizeLabel={t('noOfResults')}
        summary={total > 0 ? t('showing', { from: page * size + 1, to: Math.min(total, (page + 1) * size), total }) : undefined}
      />

      <SessionDetailSheet sessionId={viewingSessionId} onOpenChange={(open) => !open && setViewingSessionId(null)} />
    </div>
  );
}
