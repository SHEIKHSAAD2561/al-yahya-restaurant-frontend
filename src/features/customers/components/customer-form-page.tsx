'use client';

import { useState } from 'react';
import { ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, useRouter } from '@/core/i18n/navigation';
import { COUNTRY_CODES, joinPhoneNumber, splitPhoneNumber } from '@/core/phone/country-codes';
import { customersApi } from '../api/customers.api';
import { useCustomerQuery } from '../hooks/use-customer-query';
import { useSaveCustomerMutation } from '../hooks/use-save-customer-mutation';
import { customerFormSchema, type CustomerFormValues } from '../schemas/customer-form.schema';
import { CUSTOMER_GENDERS, type Customer } from '../types/customer';

export function CustomerFormPage({ customerId }: { customerId?: string }) {
  const customerQuery = useCustomerQuery(customerId);

  if (customerId && customerQuery.isPending) {
    return <Skeleton className="h-96 w-full" />;
  }
  return <CustomerForm key={customerQuery.data?.id ?? 'new'} customer={customerQuery.data} />;
}

function CustomerForm({ customer }: { customer?: Customer }) {
  const t = useTranslations('customers');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const saveMutation = useSaveCustomerMutation();
  const [generating, setGenerating] = useState(false);

  const { countryCode, number } = splitPhoneNumber(customer?.phone);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: customer?.name ?? '',
      code: customer?.code ?? '',
      phoneCountryCode: countryCode,
      phoneNumber: number,
      email: customer?.email ?? '',
      gender: customer?.gender ?? '',
      birthday: customer?.birthday ?? '',
      vatNumber: customer?.vatNumber ?? '',
      commercialRegisterNumber: customer?.commercialRegisterNumber ?? '',
      nationalId: customer?.nationalId ?? '',
      country: customer?.country ?? (customer ? '' : 'Saudi Arabia'),
      city: customer?.city ?? '',
      district: customer?.district ?? '',
      street: customer?.street ?? '',
      buildingNumber: customer?.buildingNumber ?? '',
      additionalNumber: customer?.additionalNumber ?? '',
      postalCode: customer?.postalCode ?? '',
      notes: customer?.notes ?? '',
    },
  });

  async function generateCode() {
    setGenerating(true);
    try {
      const { code } = await customersApi.generateCode();
      setValue('code', code, { shouldDirty: true, shouldValidate: true });
    } catch {
      // customersApi already surfaces the error via ApiError -> caught by caller if needed.
    } finally {
      setGenerating(false);
    }
  }

  function onSubmit(values: CustomerFormValues) {
    const input = {
      name: values.name,
      code: values.code,
      phone: joinPhoneNumber(values.phoneCountryCode, values.phoneNumber),
      email: values.email || undefined,
      gender: values.gender || undefined,
      birthday: values.birthday || undefined,
      vatNumber: values.vatNumber || undefined,
      commercialRegisterNumber: values.commercialRegisterNumber || undefined,
      nationalId: values.nationalId || undefined,
      country: values.country || undefined,
      city: values.city || undefined,
      district: values.district || undefined,
      street: values.street || undefined,
      buildingNumber: values.buildingNumber || undefined,
      additionalNumber: values.additionalNumber || undefined,
      postalCode: values.postalCode || undefined,
      notes: values.notes || undefined,
    };
    saveMutation.mutate(customer ? { id: customer.id, input } : { input }, {
      onSuccess: () => router.push('/customers'),
    });
  }

  const invalid = 'border-red-500 focus-visible:ring-red-500';

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <nav className="flex items-center gap-1 text-sm">
        <Link href="/customers" className="text-brand hover:underline">
          {t('title')}
        </Link>
        <ChevronRight className="size-4 text-zinc-400 rtl:rotate-180" />
        <span className="text-zinc-700">{customer ? customer.name : t('newCustomer')}</span>
      </nav>

      <form onSubmit={handleSubmit(onSubmit, () => toast.error(t('fixErrors')))} className="space-y-4" noValidate>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900">{t('customerDetails')}</h2>
          <h3 className="mb-3 text-sm font-medium text-zinc-700">{t('personalInformation')}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="customerName">
                <span className="text-red-600">*</span> {t('customerName')}
              </Label>
              <Input id="customerName" className={errors.name ? invalid : undefined} {...register('name')} />
              {errors.name && <p className="text-sm text-red-600">{t('required')}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customerCode">
                <span className="text-red-600">*</span> {t('code')}
              </Label>
              <div className="flex gap-2">
                <Input id="customerCode" dir="ltr" className={errors.code ? invalid : undefined} {...register('code')} />
                <Button type="button" variant="outline" onClick={() => void generateCode()} disabled={generating}>
                  {generating ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                  {t('autoGenerate')}
                </Button>
              </div>
              {errors.code && <p className="text-sm text-red-600">{t('required')}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phoneNumber">
                <span className="text-red-600">*</span> {t('phoneNumber')}
              </Label>
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
                        {COUNTRY_CODES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.code} {locale === 'ar' ? c.labelAr : c.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <Input
                  id="phoneNumber"
                  dir="ltr"
                  className={errors.phoneNumber ? invalid : undefined}
                  {...register('phoneNumber')}
                />
              </div>
              {errors.phoneNumber && <p className="text-sm text-red-600">{t('required')}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">{t('email')}</Label>
              <Input id="email" type="email" {...register('email')} />
            </div>

            <div className="space-y-1.5">
              <Label>{t('gender')}</Label>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('genderPlaceholder')}>
                        {field.value ? t(`genders.${field.value}`) : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(CUSTOMER_GENDERS).map((value) => (
                        <SelectItem key={value} value={value}>
                          {t(`genders.${value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="birthday">{t('birthday')}</Label>
              <Input id="birthday" type="date" {...register('birthday')} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vatNumber">{t('vatNumber')}</Label>
              <Input id="vatNumber" dir="ltr" className={errors.vatNumber ? invalid : undefined} {...register('vatNumber')} />
              <p className="text-xs text-zinc-400">{t('vatNumberHint')}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="commercialRegisterNumber">{t('commercialRegisterNumber')}</Label>
              <Input id="commercialRegisterNumber" dir="ltr" {...register('commercialRegisterNumber')} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nationalId">{t('nationalId')}</Label>
              <Input id="nationalId" dir="ltr" {...register('nationalId')} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">{t('customFields')}</h2>
            <Button type="button" size="sm" variant="outline" disabled>
              {t('addCustomField')}
            </Button>
          </div>
          <p className="flex items-center gap-2 text-xs text-zinc-400">
            <Badge>{tCommon('comingSoon')}</Badge>
            {t('customFieldsHint')}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <label className="flex items-center gap-2 text-sm text-zinc-500">
            <Checkbox disabled />
            {t('setOpeningBalance')}
          </label>
          <p className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
            <Badge>{tCommon('comingSoon')}</Badge>
            {t('openingBalanceHint')}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900">{t('address')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="country">{t('country')}</Label>
              <Input id="country" {...register('country')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">{t('city')}</Label>
              <Input id="city" {...register('city')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="district">{t('districtName')}</Label>
              <Input id="district" {...register('district')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="street">{t('streetName')}</Label>
              <Input id="street" {...register('street')} />
              <p className="text-xs text-zinc-400">{t('streetNameHint')}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="buildingNumber">{t('buildingNo')}</Label>
              <Input id="buildingNumber" {...register('buildingNumber')} />
              <p className="text-xs text-zinc-400">{t('buildingNoHint')}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="additionalNumber">{t('additionalNumber')}</Label>
              <Input id="additionalNumber" {...register('additionalNumber')} />
              <p className="text-xs text-zinc-400">{t('additionalNumberHint')}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="postalCode">{t('postalCode')}</Label>
              <Input id="postalCode" {...register('postalCode')} />
              <p className="text-xs text-zinc-400">{t('postalCodeHint')}</p>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <Label htmlFor="notes">{t('notes')}</Label>
            <textarea
              id="notes"
              rows={3}
              {...register('notes')}
              className="flex w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => router.push('/customers')}>
            {tCommon('cancel')}
          </Button>
          <Button type="submit" disabled={saveMutation.isPending}>
            {tCommon('save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
