'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { CircleDot, Circle, ShieldCheck, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter } from '@/components/ui/sheet';
import { useRolesQuery } from '@/features/roles/hooks/use-roles-query';
import { useLocationsQuery } from '@/features/locations/hooks/use-locations-query';
import { useCreateUserMutation } from '../hooks/use-create-user-mutation';
import { useUpdateUserMutation } from '../hooks/use-update-user-mutation';
import { userFormSchema, type UserFormInput } from '../schemas/user-form.schema';
import { LANGUAGES, type User } from '../types/user';
import { ROLE_TYPES } from '@/core/auth/role-type';
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE, splitPhoneNumber, joinPhoneNumber } from '@/core/phone/country-codes';

interface UserDrawerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
}

export function UserDrawerForm({ open, onOpenChange, user }: UserDrawerFormProps) {
  const t = useTranslations('settings.users');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{user ? t('editUser') : t('addUser')}</SheetTitle>
        </SheetHeader>
        {/* Keyed by user id (or 'new') so switching targets always mounts
         * fresh defaultValues instead of reset()-ing an existing form — this
         * app's React Compiler setup doesn't reliably re-render
         * Controller-bound fields (role picker, phone country code, etc.)
         * when values are set from an effect after the initial mount. Radix's
         * Dialog content unmounts while closed, so this only ever mounts once
         * per open. */}
        <UserDrawerFormBody key={user?.id ?? 'new'} user={user} onOpenChange={onOpenChange} />
      </SheetContent>
    </Sheet>
  );
}

function UserDrawerFormBody({
  user,
  onOpenChange,
}: {
  user?: User | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations('settings.users');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const isEdit = Boolean(user);
  const isSuperAdmin = user?.role.type === ROLE_TYPES.SUPER_ADMIN;

  const rolesQuery = useRolesQuery();
  const locationsQuery = useLocationsQuery();
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const isSaving = createUserMutation.isPending || updateUserMutation.isPending;

  const { countryCode, number } = splitPhoneNumber(user?.phone);

  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<UserFormInput>({
    resolver: zodResolver(userFormSchema),
    defaultValues: user
      ? {
          nameEn: user.nameEn,
          nameAr: user.nameAr,
          email: user.email,
          phoneCountryCode: countryCode,
          phoneNumber: number,
          roleId: user.roleId,
          allLocations: user.allLocations,
          locationIds: user.locations.map((location) => location.id),
          preferredLanguage: user.preferredLanguage,
        }
      : {
          nameEn: '',
          nameAr: '',
          email: '',
          phoneCountryCode: DEFAULT_COUNTRY_CODE,
          phoneNumber: '',
          roleId: '',
          allLocations: true,
          locationIds: [],
          preferredLanguage: LANGUAGES.EN,
        },
  });

  const allLocations = watch('allLocations');

  function onSubmit(values: UserFormInput) {
    const payload = {
      nameEn: values.nameEn,
      nameAr: values.nameAr,
      phone: values.phoneNumber ? joinPhoneNumber(values.phoneCountryCode, values.phoneNumber) : undefined,
      roleId: values.roleId,
      allLocations: values.allLocations,
      locationIds: values.allLocations ? [] : values.locationIds,
      preferredLanguage: values.preferredLanguage,
    };

    if (isEdit && user) {
      updateUserMutation.mutate({ id: user.id, payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createUserMutation.mutate(
        { ...payload, email: values.email },
        { onSuccess: () => onOpenChange(false) },
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
      <SheetBody className="space-y-8">
        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="nameEn">{t('nameEn')}</Label>
              <Input id="nameEn" {...register('nameEn')} />
              {errors.nameEn && <p className="text-sm text-red-600">{errors.nameEn.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nameAr">{t('nameAr')}</Label>
              <Input id="nameAr" dir="rtl" {...register('nameAr')} />
              {errors.nameAr && <p className="text-sm text-red-600">{errors.nameAr.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">{t('email')}</Label>
            <Input id="email" type="email" disabled={isEdit} {...register('email')} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phoneNumber">{t('phone')}</Label>
            <div className="flex gap-2">
              <Controller
                control={control}
                name="phoneCountryCode"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-24 shrink-0">
                      <SelectValue>{field.value}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_CODES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.code} {locale === 'ar' ? country.labelAr : country.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <Input id="phoneNumber" className="flex-1" {...register('phoneNumber')} />
            </div>
            {errors.phoneNumber && (
              <p className="text-sm text-red-600">{errors.phoneNumber.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>{t('preferredLanguage')}</Label>
            <Controller
              control={control}
              name="preferredLanguage"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue>
                      {field.value === LANGUAGES.AR ? 'العربية' : 'English'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LANGUAGES.EN}>English</SelectItem>
                    <SelectItem value={LANGUAGES.AR}>العربية</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </section>

        <section className="space-y-3">
          <Label>{t('role')}</Label>
          {isSuperAdmin ? (
            <p className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-500">
              {t('superAdminRoleLocked')}
            </p>
          ) : (
            <>
              <Controller
                control={control}
                name="roleId"
                render={({ field }) => (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(rolesQuery.data ?? []).map((role) => {
                      const selected = field.value === role.id;
                      const RoleIcon = role.isLocked ? ShieldCheck : UserCog;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => field.onChange(role.id)}
                          className={cn(
                            'flex items-start gap-2.5 rounded-xl border p-3 text-start text-sm transition-colors',
                            selected
                              ? 'border-brand bg-brand-muted'
                              : 'border-zinc-200 hover:border-zinc-300',
                          )}
                        >
                          {selected ? (
                            <CircleDot className="mt-0.5 size-4 shrink-0 text-brand" />
                          ) : (
                            <Circle className="mt-0.5 size-4 shrink-0 text-zinc-300" />
                          )}
                          <span>
                            <span
                              className={cn(
                                'flex items-center gap-1.5 font-medium',
                                selected ? 'text-brand' : 'text-zinc-900',
                              )}
                            >
                              <RoleIcon className="size-3.5" />
                              {role.name}
                            </span>
                            {role.description && (
                              <span className="mt-0.5 block text-xs text-zinc-500">
                                {role.description}
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              />
              {errors.roleId && <p className="text-sm text-red-600">{errors.roleId.message}</p>}
            </>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-4">
            <div>
              <p className="text-sm font-medium text-zinc-900">{t('allLocations')}</p>
              <p className="text-sm text-zinc-500">{t('allLocationsDescription')}</p>
            </div>
            <Controller
              control={control}
              name="allLocations"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    // Pre-select the default location the first time a new
                    // user's location list is narrowed, rather than leaving
                    // it empty for the admin to figure out.
                    if (!checked && getValues('locationIds').length === 0) {
                      const defaultLocation = locationsQuery.data?.find((l) => l.isDefault);
                      if (defaultLocation) setValue('locationIds', [defaultLocation.id]);
                    }
                  }}
                />
              )}
            />
          </div>

          {!allLocations && (
            <div className="space-y-2 rounded-xl border border-zinc-200 p-4">
              <p className="text-sm font-medium text-zinc-900">{t('selectLocations')}</p>
              <Controller
                control={control}
                name="locationIds"
                render={({ field }) => (
                  <div className="space-y-2">
                    {(locationsQuery.data ?? []).map((location) => {
                      const checked = field.value.includes(location.id);
                      return (
                        <label
                          key={location.id}
                          className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-zinc-50"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => {
                              field.onChange(
                                value
                                  ? [...field.value, location.id]
                                  : field.value.filter((id) => id !== location.id),
                              );
                            }}
                          />
                          <span className="text-sm text-zinc-700">{location.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              />
              {errors.locationIds && (
                <p className="text-sm text-red-600">{errors.locationIds.message}</p>
              )}
            </div>
          )}
        </section>
      </SheetBody>

      <SheetFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          {tCommon('cancel')}
        </Button>
        <Button type="submit" disabled={isSaving}>
          {tCommon('save')}
        </Button>
      </SheetFooter>
    </form>
  );
}
