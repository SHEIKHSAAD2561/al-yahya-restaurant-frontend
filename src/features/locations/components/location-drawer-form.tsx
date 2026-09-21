'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
} from '@/components/ui/sheet';
import { useCreateLocationMutation } from '../hooks/use-create-location-mutation';
import { useUpdateLocationMutation } from '../hooks/use-update-location-mutation';
import { locationFormSchema, type LocationFormInput } from '../schemas/location.schema';
import type { Location } from '../types/location';

interface LocationDrawerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: Location | null;
}

const EMPTY_VALUES: LocationFormInput = { name: '', address: '', isDefault: false };

export function LocationDrawerForm({ open, onOpenChange, location }: LocationDrawerFormProps) {
  const t = useTranslations('settings.locations');
  const tCommon = useTranslations('common');
  const isEdit = Boolean(location);

  const createMutation = useCreateLocationMutation();
  const updateMutation = useUpdateLocationMutation();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LocationFormInput>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      location
        ? { name: location.name, address: location.address ?? '', isDefault: location.isDefault }
        : EMPTY_VALUES,
    );
  }, [open, location, reset]);

  function onSubmit(values: LocationFormInput) {
    const input = {
      name: values.name,
      address: values.address || undefined,
      isDefault: values.isDefault,
    };

    if (isEdit && location) {
      updateMutation.mutate({ id: location.id, input }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(input, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-md">
        <SheetHeader>
          <SheetTitle>{isEdit ? t('editLocation') : t('addLocation')}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
          <SheetBody className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">{t('name')}</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">{t('address')}</Label>
              <Input id="address" {...register('address')} />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-4">
              <div>
                <p className="text-sm font-medium text-zinc-900">{t('isDefault')}</p>
                <p className="text-sm text-zinc-500">{t('isDefaultDescription')}</p>
              </div>
              <Controller
                control={control}
                name="isDefault"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={Boolean(location?.isDefault)}
                  />
                )}
              />
            </div>
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
