'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { ImageIcon, Loader2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useCompanyQuery } from '../hooks/use-company-query';
import { useUpdateCompanyMutation } from '../hooks/use-update-company-mutation';
import { useUploadLogoMutation } from '../hooks/use-upload-logo-mutation';
import { companyFormSchema, type CompanyFormInput } from '../schemas/company.schema';
import { BUSINESS_TYPES, type Company } from '../types/company';

export function CompanyOverviewPage() {
  const companyQuery = useCompanyQuery();

  if (companyQuery.isPending) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  // Keyed by updatedAt so a fresh save remounts the form with its own new
  // values as `defaultValues` — no reset()-in-effect needed. A Radix <Select>
  // is a controlled component driven through react-hook-form's Controller,
  // and this app's React Compiler setup doesn't reliably re-render it when
  // reset() fires from an effect (register()-bound plain <input>s aren't
  // affected, since RHF writes those straight to the DOM node).
  return <CompanyOverviewForm key={companyQuery.data!.updatedAt} company={companyQuery.data!} />;
}

function CompanyOverviewForm({ company }: { company: Company }) {
  const t = useTranslations('settings.company');
  const tCommon = useTranslations('common');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateCompanyMutation = useUpdateCompanyMutation();
  const uploadLogoMutation = useUploadLogoMutation();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyFormInput>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: company.name ?? '',
      vatNumber: company.vatNumber ?? '',
      email: company.email ?? '',
      phone: company.phone ?? '',
      website: company.website ?? '',
      businessType: company.businessType ?? '',
      address: company.address ?? '',
      commercialRegister: company.commercialRegister ?? '',
    },
  });

  function onSubmit(values: CompanyFormInput) {
    updateCompanyMutation.mutate({
      name: values.name,
      vatNumber: values.vatNumber || undefined,
      email: values.email,
      phone: values.phone || undefined,
      website: values.website || undefined,
      businessType: values.businessType,
      address: values.address || undefined,
      commercialRegister: values.commercialRegister || undefined,
    });
  }

  function handleLogoSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) uploadLogoMutation.mutate(file);
  }

  // Firebase Storage download URLs are absolute and publicly loadable — no
  // rewriting needed (unlike the old locally-hosted-file scheme).
  const logoUrl = company.logoUrl;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="mb-6 space-y-2">
          <p className="text-sm font-medium text-brand">{t('companyLogo')}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={handleLogoSelected}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadLogoMutation.isPending}
            className="relative flex size-16 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-400 transition-colors hover:border-brand"
          >
            {uploadLogoMutation.isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : logoUrl ? (
              <Image src={logoUrl} alt="" fill className="object-cover" unoptimized />
            ) : (
              <ImageIcon className="size-6" />
            )}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">{t('companyName')}</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vatNumber">{t('vatNumber')}</Label>
            <Input id="vatNumber" {...register('vatNumber')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">{t('email')}</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">{t('phone')}</Label>
            <Input id="phone" {...register('phone')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="website">{t('website')}</Label>
            <Input id="website" placeholder="https://" {...register('website')} />
            {errors.website && <p className="text-sm text-red-600">{errors.website.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>{t('businessType')}</Label>
            <Controller
              control={control}
              name="businessType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('businessTypePlaceholder')}>
                      {field.value ? t(`businessTypes.${field.value}`) : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(BUSINESS_TYPES).map((value) => (
                      <SelectItem key={value} value={value}>
                        {t(`businessTypes.${value}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.businessType && (
              <p className="text-sm text-red-600">{errors.businessType.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">{t('companyAddress')}</Label>
            <Input id="address" {...register('address')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="commercialRegister">{t('commercialRegister')}</Label>
            <Input id="commercialRegister" {...register('commercialRegister')} />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={updateCompanyMutation.isPending}>
          {tCommon('save')}
        </Button>
      </div>
    </form>
  );
}
