'use client';

import { useState } from 'react';
import { Check, ChevronRight, CreditCard, Printer, Users, Grid2x2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from '@/core/i18n/navigation';
import { useUsersQuery } from '@/features/users/hooks/use-users-query';
import { useLocationsQuery } from '@/features/locations/hooks/use-locations-query';
import { usePaymentMethodsQuery } from '@/features/payment-methods/hooks/use-payment-methods-query';
import { useSaveRegisterMutation } from '../hooks/use-save-register-mutation';
import { useRegisterQuery } from '../hooks/use-register-query';
import { PRINTER_TYPES, SELL_LAYOUTS, type PrinterType, type RegisterSummary } from '../types/register';
import { MultiSelectSheet } from './multi-select-sheet';

const MAX_NAME_LENGTH = 35;

interface RegisterFormPageProps {
  /** Required for a new register (which location it belongs to); ignored
   * when editing, where the register's own locationId is used instead. */
  locationId?: string;
  /** Present when editing an existing register's settings. */
  registerId?: string;
}

export function RegisterFormPage({ locationId, registerId }: RegisterFormPageProps) {
  const registerQuery = useRegisterQuery(registerId);
  const locationsQuery = useLocationsQuery();

  if ((registerId && registerQuery.isPending) || locationsQuery.isPending) {
    return <Skeleton className="h-96 w-full" />;
  }

  const effectiveLocationId = registerQuery.data?.locationId ?? locationId ?? '';
  const locationName = locationsQuery.data?.find((location) => location.id === effectiveLocationId)?.name ?? '';

  return (
    <RegisterForm
      key={registerQuery.data?.id ?? 'new'}
      locationId={effectiveLocationId}
      locationName={locationName}
      register={registerQuery.data}
    />
  );
}

function RegisterForm({
  locationId,
  locationName,
  register,
}: {
  locationId: string;
  locationName: string;
  register?: RegisterSummary;
}) {
  const t = useTranslations('registers');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const saveMutation = useSaveRegisterMutation();

  const usersQuery = useUsersQuery({});
  const paymentMethodsQuery = usePaymentMethodsQuery();

  const [name, setName] = useState(register?.name ?? '');
  const [cashierIds, setCashierIds] = useState<string[]>(register?.cashiers.map((c) => c.id) ?? []);
  const [paymentMethodIds, setPaymentMethodIds] = useState<string[]>(
    register?.paymentMethods.map((m) => m.id) ?? [],
  );
  const [printerType, setPrinterType] = useState<PrinterType>(register?.printerType ?? PRINTER_TYPES.THERMAL);
  const [sheet, setSheet] = useState<'cashiers' | 'paymentMethods' | null>(null);

  const eligibleUsers = (usersQuery.data ?? []).filter(
    (user) => user.status === 'ACTIVE' && (user.allLocations || user.locations.some((l) => l.id === locationId)),
  );
  const cashierItems = eligibleUsers.map((user) => ({
    id: user.id,
    label: locale === 'ar' ? user.nameAr : user.nameEn,
  }));
  const paymentMethodItems = (paymentMethodsQuery.data ?? []).map((method) => ({
    id: method.id,
    label: method.name,
  }));

  const cashierLabel = (id: string) => cashierItems.find((item) => item.id === id)?.label ?? '';
  const paymentMethodLabel = (id: string) => paymentMethodItems.find((item) => item.id === id)?.label ?? '';

  const canSubmit = name.trim().length > 0 && cashierIds.length > 0 && paymentMethodIds.length > 0;

  function handleSubmit() {
    const input = { name: name.trim(), cashierIds, paymentMethodIds, printerType };
    saveMutation.mutate(register ? { id: register.id, input } : { input: { ...input, locationId } }, {
      onSuccess: () => router.push('/pos'),
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-4 flex items-center justify-between border-b border-zinc-200 pb-4">
        <h1 className="text-lg font-semibold text-zinc-900">{register ? t('editRegister') : t('newRegister')}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/pos')}>
            {tCommon('cancel')}
          </Button>
          <Button disabled={!canSubmit || saveMutation.isPending} onClick={handleSubmit}>
            <Check className="size-4" />
            {register ? t('saveChanges') : t('createNewRegister')}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-zinc-500">{locationName}</p>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value.slice(0, MAX_NAME_LENGTH))}
            placeholder={t('registerNamePlaceholder')}
            maxLength={MAX_NAME_LENGTH}
          />
          <p className="text-end text-xs text-zinc-400">
            {name.length}/{MAX_NAME_LENGTH}
          </p>
        </div>

        <div className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white">
          <SettingsRow
            icon={Users}
            label={t('assignedCashiers')}
            value={cashierIds.map(cashierLabel).join(', ') || t('none')}
            onClick={() => setSheet('cashiers')}
          />
          <SettingsRow
            icon={CreditCard}
            label={t('paymentMethods')}
            value={paymentMethodIds.map(paymentMethodLabel).join(', ') || t('none')}
            onClick={() => setSheet('paymentMethods')}
          />
          <div className="flex items-center justify-between gap-4 px-4 py-3.5">
            <span className="flex items-center gap-3 text-sm font-medium text-zinc-800">
              <Printer className="size-4 text-zinc-400" />
              {t('printerType')}
            </span>
            <Select value={printerType} onValueChange={(value) => setPrinterType(value as PrinterType)}>
              <SelectTrigger className="w-40">
                <SelectValue>{t(`printerTypes.${printerType}`)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.values(PRINTER_TYPES).map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(`printerTypes.${value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-3.5">
            <span className="flex items-center gap-3 text-sm font-medium text-zinc-800">
              <Grid2x2 className="size-4 text-zinc-400" />
              {t('sellLayout')}
            </span>
            {/* Only one layout exists today — shown, not chosen. */}
            <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-sm text-zinc-600">
              {t(`sellLayouts.${SELL_LAYOUTS.QUICK_SALE}`)}
            </span>
          </div>
        </div>
      </div>

      <MultiSelectSheet
        open={sheet === 'cashiers'}
        onOpenChange={(open) => !open && setSheet(null)}
        title={t('assignedCashiers')}
        items={cashierItems}
        selectedIds={cashierIds}
        onApply={setCashierIds}
      />
      <MultiSelectSheet
        open={sheet === 'paymentMethods'}
        onOpenChange={(open) => !open && setSheet(null)}
        title={t('paymentMethods')}
        items={paymentMethodItems}
        selectedIds={paymentMethodIds}
        onApply={setPaymentMethodIds}
      />
    </div>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-start hover:bg-zinc-50"
    >
      <span className="flex items-center gap-3 text-sm font-medium text-zinc-800">
        <Icon className="size-4 text-zinc-400" />
        {label}
      </span>
      <span className="flex items-center gap-2">
        <span className="max-w-56 truncate rounded-md bg-zinc-100 px-2.5 py-1 text-sm text-zinc-600">{value}</span>
        <ChevronRight className="size-4 text-zinc-400 rtl:rotate-180" />
      </span>
    </button>
  );
}
