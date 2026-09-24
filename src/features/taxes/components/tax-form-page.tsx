'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useForm, useFieldArray, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter, Link } from '@/core/i18n/navigation';
import { useTaxQuery } from '../hooks/use-tax-query';
import { useCreateTaxMutation } from '../hooks/use-create-tax-mutation';
import { useUpdateTaxMutation } from '../hooks/use-update-tax-mutation';
import { taxFormSchema, type TaxFormInput } from '../schemas/tax-form.schema';
import { TAX_TYPES } from '../types/tax-type';
import type { Tax } from '../types/tax';

export function TaxFormPage({ taxId }: { taxId?: string }) {
  if (!taxId) {
    return <TaxForm tax={null} />;
  }
  return <EditTaxFormLoader taxId={taxId} />;
}

function EditTaxFormLoader({ taxId }: { taxId: string }) {
  const taxQuery = useTaxQuery(taxId);

  if (taxQuery.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!taxQuery.data) return null;

  // Keyed by updatedAt so a fresh save remounts the form with its own new
  // values as defaultValues — same fix as the Company Overview form, for the
  // same reason: this app's React Compiler setup doesn't reliably re-render
  // react-hook-form's Controller-bound fields when values are set from an
  // effect after the initial mount.
  return <TaxForm key={taxQuery.data.updatedAt} tax={taxQuery.data} />;
}

function TaxForm({ tax }: { tax: Tax | null }) {
  const t = useTranslations('settings.taxes');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const createMutation = useCreateTaxMutation();
  const updateMutation = useUpdateTaxMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const isReadOnly = tax !== null && tax.type !== TAX_TYPES.CUSTOM;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TaxFormInput>({
    resolver: zodResolver(taxFormSchema),
    defaultValues: tax
      ? {
          name: tax.name,
          code: tax.code,
          hasCompoundTax: tax.hasCompoundTax,
          lines: tax.lines
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((line) => ({ label: line.label ?? '', rate: line.rate })),
          compoundLabel: tax.compoundLabel ?? '',
          compoundRate: tax.compoundRate ?? undefined,
        }
      : {
          name: '',
          code: '',
          hasCompoundTax: false,
          lines: [{ label: '', rate: 0 }],
          compoundLabel: '',
          compoundRate: undefined,
        },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });
  const lines = useWatch({ control, name: 'lines' });
  const hasCompoundTax = useWatch({ control, name: 'hasCompoundTax' });
  const compoundRate = useWatch({ control, name: 'compoundRate' });

  const subtotalRate = (lines ?? []).reduce((sum, line) => sum + (Number(line.rate) || 0), 0);
  const compoundRateValue = hasCompoundTax ? Number(compoundRate) || 0 : 0;
  // Tax-on-tax: the compound rate applies on top of the subtotal, not just
  // alongside it — e.g. a 100% line plus a 15% compound tax is a 130%
  // effective rate (100 + 15 + 100*0.15), not 115%.
  const effectiveRate = hasCompoundTax
    ? subtotalRate + compoundRateValue + (subtotalRate * compoundRateValue) / 100
    : subtotalRate;

  function onSubmit(values: TaxFormInput) {
    const payload = {
      name: values.name,
      code: values.code,
      hasCompoundTax: values.hasCompoundTax,
      lines: values.lines.map((line) => ({ label: line.label || undefined, rate: line.rate })),
      compoundLabel: values.hasCompoundTax ? values.compoundLabel || undefined : undefined,
      compoundRate: values.hasCompoundTax ? values.compoundRate : undefined,
    };

    if (tax) {
      updateMutation.mutate({ id: tax.id, input: payload }, { onSuccess: () => router.push('/settings/taxes') });
    } else {
      createMutation.mutate(payload, { onSuccess: () => router.push('/settings/taxes') });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h1 className="text-lg font-semibold text-zinc-900">{tax ? t('editTax') : t('addNewTax')}</h1>

      {isReadOnly && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
          {t('systemTaxNotEditable')}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">{t('taxName')}</Label>
                <Input id="name" disabled={isReadOnly} {...register('name')} />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="code">{t('taxCode')}</Label>
                <Input id="code" disabled={isReadOnly} {...register('code')} />
                {errors.code && <p className="text-sm text-red-600">{errors.code.message}</p>}
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-zinc-200 p-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-3">
                  <div className="flex-1 space-y-1.5">
                    {index === 0 && <Label>{t('taxLine')}</Label>}
                    <Input
                      placeholder={t('taxLine')}
                      disabled={isReadOnly}
                      {...register(`lines.${index}.label`)}
                    />
                  </div>
                  <div className="w-32 space-y-1.5">
                    {index === 0 && <Label>{t('rate')}</Label>}
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        className="pe-8"
                        disabled={isReadOnly}
                        {...register(`lines.${index}.rate`, { valueAsNumber: true })}
                      />
                      <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                        %
                      </span>
                    </div>
                  </div>
                  {fields.length > 1 && !isReadOnly && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="mb-0.5 rounded-md p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                      aria-label={tCommon('delete')}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              ))}
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => append({ label: '', rate: 0 })}
                  className="flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
                >
                  <Plus className="size-4" />
                  {t('addLine')}
                </button>
              )}
              {errors.lines && typeof errors.lines.message === 'string' && (
                <p className="text-sm text-red-600">{errors.lines.message}</p>
              )}
            </div>

            <Controller
              control={control}
              name="hasCompoundTax"
              render={({ field }) => (
                <label className="flex items-center gap-2.5">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isReadOnly}
                  />
                  <span className="text-sm text-zinc-700">{t('hasCompoundTax')}</span>
                </label>
              )}
            />
          </div>

          {hasCompoundTax && (
            <div className="flex items-end gap-3 rounded-xl border border-zinc-200 bg-white p-4">
              <div className="flex-1 space-y-1.5">
                <Input
                  placeholder={t('compoundTaxPlaceholder')}
                  disabled={isReadOnly}
                  {...register('compoundLabel')}
                />
              </div>
              <div className="w-32 space-y-1.5">
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    className="pe-8"
                    disabled={isReadOnly}
                    {...register('compoundRate', { valueAsNumber: true })}
                  />
                  <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                    %
                  </span>
                </div>
                {errors.compoundRate && (
                  <p className="text-sm text-red-600">{errors.compoundRate.message}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white p-6">
          {hasCompoundTax ? (
            <>
              <div className="flex items-center justify-between py-3 first:pt-0">
                <p className="text-sm text-zinc-500">{t('subtotalRate')}</p>
                <p className="text-sm text-zinc-900">{subtotalRate.toFixed(1)}</p>
              </div>
              <div className="flex items-center justify-between py-3">
                <p className="text-sm text-zinc-500">{t('compoundRate')}</p>
                <p className="text-sm text-zinc-900">{compoundRateValue.toFixed(1)}</p>
              </div>
              <div className="flex items-center justify-between py-3 last:pb-0">
                <p className="text-sm font-semibold text-brand">{t('effectiveRate')}</p>
                <p className="text-sm font-semibold text-brand">{effectiveRate.toFixed(1)}</p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <p className="text-sm text-zinc-500">{t('totalRate')}</p>
              <p className="text-sm text-zinc-900">{effectiveRate.toFixed(1)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!isReadOnly && (
          <Button type="submit" disabled={isPending}>
            {tax ? tCommon('save') : tCommon('create')}
          </Button>
        )}
        <Button type="button" variant={isReadOnly ? 'outline' : 'ghost'} asChild>
          <Link href="/settings/taxes">{tCommon('cancel')}</Link>
        </Button>
      </div>
    </form>
  );
}
