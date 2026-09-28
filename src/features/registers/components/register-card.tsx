'use client';

import { useState } from 'react';
import { Lock, Settings as SettingsIcon, Unlock, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/core/i18n/navigation';
import { useSession, usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import type { RegisterSummary } from '../types/register';
import { AddWithdrawDialog } from './add-withdraw-dialog';

function formatDateTime(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', month: 'long', day: '2-digit', year: 'numeric' }).format(new Date(iso));
}

export function RegisterCard({ register, locale }: { register: RegisterSummary; locale: string }) {
  const t = useTranslations('registers');
  const session = useSession();
  const canManageSettings = usePermission(PERMISSIONS.POS_MANAGE_SALE_SETTINGS);
  const canManageCash = usePermission(PERMISSIONS.POS_MANAGE_CASH);
  const [cashDialogOpen, setCashDialogOpen] = useState(false);

  const isOpen = register.openSession !== null;
  const isCashier = register.cashiers.some((cashier) => cashier.id === session.id);
  const operatorLabel = isOpen
    ? register.openSession!.openedByUserId === session.id
      ? t('you')
      : register.openSession!.openedByName
    : t('you');

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <Badge variant={isOpen ? 'success' : 'neutral'}>
          {isOpen ? (
            <>
              <Unlock className="size-3" /> {t('openBy', { name: operatorLabel })}
            </>
          ) : (
            <>
              <Lock className="size-3" /> {t('closedBy', { name: operatorLabel })}
            </>
          )}
        </Badge>
        {canManageSettings && (
          <Button asChild size="sm" variant="outline">
            <Link href={`/pos/registers/${register.id}/edit`}>
              <SettingsIcon className="size-4" />
              {t('settings')}
            </Link>
          </Button>
        )}
      </div>

      <h3 className="mb-1 font-semibold text-zinc-900">{register.name}</h3>
      <p className="mb-3 text-xs text-zinc-500">
        {isOpen
          ? t('openedAt', { time: formatDateTime(register.openSession!.openedAt, locale) })
          : t('notOpenYet')}
      </p>

      <div className="mb-4 space-y-1.5 border-t border-zinc-100 pt-3 text-sm text-zinc-600">
        <p className="flex items-center gap-2">
          <span className="text-zinc-400">{t('assignedCashiers')}:</span>
          {register.cashiers.map((cashier) => (locale === 'ar' ? cashier.nameAr : cashier.nameEn)).join(', ')}
        </p>
        <p className="flex items-center gap-2">
          <span className="text-zinc-400">{t('paymentMethods')}:</span>
          {register.paymentMethods.map((method) => method.name).join(', ')}
        </p>
        <p className="flex items-center gap-2">
          <span className="text-zinc-400">{t('printerType')}:</span>
          {t(`printerTypes.${register.printerType}`)}
        </p>
      </div>

      {isCashier ? (
        isOpen ? (
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/pos/registers/${register.id}`}>{t('continueSelling')}</Link>
            </Button>
            {canManageCash && (
              <Button size="icon" variant="outline" aria-label={t('addWithdraw')} onClick={() => setCashDialogOpen(true)}>
                <Wallet className="size-4" />
              </Button>
            )}
            <Button asChild variant="ghost" className="text-red-600 hover:text-red-700">
              <Link href={`/pos/registers/${register.id}/close`}>{t('closeRegister')}</Link>
            </Button>
          </div>
        ) : (
          <Button asChild className="w-full">
            <Link href={`/pos/registers/${register.id}/open`}>{t('openRegister')}</Link>
          </Button>
        )
      ) : (
        <p className="rounded-lg bg-zinc-50 px-3 py-2 text-center text-xs text-zinc-400">{t('notAssigned')}</p>
      )}

      <AddWithdrawDialog open={cashDialogOpen} onOpenChange={setCashDialogOpen} registerId={register.id} />
    </div>
  );
}
