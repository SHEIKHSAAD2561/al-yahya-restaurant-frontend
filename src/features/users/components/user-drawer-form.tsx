'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
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

interface UserDrawerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
}

const EMPTY_VALUES: UserFormInput = {
  nameEn: '',
  nameAr: '',
  email: '',
  phone: '',
  roleId: '',
  allLocations: true,
  locationIds: [],
  preferredLanguage: LANGUAGES.EN,
};

export function UserDrawerForm({ open, onOpenChange, user }: UserDrawerFormProps) {
  const t = useTranslations('settings.users');
  const tCommon = useTranslations('common');
  const isEdit = Boolean(user);

  const rolesQuery = useRolesQuery();
  const locationsQuery = useLocationsQuery();
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const isSaving = createUserMutation.isPending || updateUserMutation.isPending;

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<UserFormInput>({
    resolver: zodResolver(userFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      user
        ? {
            nameEn: user.nameEn,
            nameAr: user.nameAr,
            email: user.email,
            phone: user.phone ?? '',
            roleId: user.roleId,
            allLocations: user.allLocations,
            locationIds: user.locations.map((location) => location.id),
            preferredLanguage: user.preferredLanguage,
          }
        : EMPTY_VALUES,
    );
  }, [open, user, reset]);

  const allLocations = watch('allLocations');

  function onSubmit(values: UserFormInput) {
    const payload = {
      nameEn: values.nameEn,
      nameAr: values.nameAr,
      phone: values.phone || undefined,
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEdit ? t('editUser') : t('addUser')}</SheetTitle>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col overflow-hidden"
        >
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
                <Label htmlFor="phone">{t('phone')}</Label>
                <Input id="phone" {...register('phone')} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('preferredLanguage')}</Label>
                <Controller
                  control={control}
                  name="preferredLanguage"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
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
              <Controller
                control={control}
                name="roleId"
                render={({ field }) => (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(rolesQuery.data ?? []).map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => field.onChange(role.id)}
                        className={cn(
                          'rounded-xl border p-3 text-start text-sm font-medium transition-colors',
                          field.value === role.id
                            ? 'border-brand bg-brand-muted text-brand'
                            : 'border-zinc-200 text-zinc-700 hover:border-zinc-300',
                        )}
                      >
                        {role.name}
                      </button>
                    ))}
                  </div>
                )}
              />
              {errors.roleId && <p className="text-sm text-red-600">{errors.roleId.message}</p>}
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
      </SheetContent>
    </Sheet>
  );
}
