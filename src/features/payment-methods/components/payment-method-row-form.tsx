'use client';

import { Check, X } from 'lucide-react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useCreatePaymentMethodMutation } from '../hooks/use-create-payment-method-mutation';
import { useUpdatePaymentMethodMutation } from '../hooks/use-update-payment-method-mutation';
import { paymentMethodFormSchema, type PaymentMethodFormInput } from '../schemas/payment-method.schema';
import {
  PAYMENT_METHOD_TYPES,
  bankAccountLabel,
  type BankAccount,
  type PaymentMethod,
  type PaymentMethodType,
} from '../types/payment-method';

interface PaymentMethodRowFormProps {
  /** Omit to add a new payment method. */
  paymentMethod?: PaymentMethod;
  bankAccounts: BankAccount[];
  onDone: () => void;
}

/**
 * Inline add/edit row (Rewaa-style — no drawer). Mounted only while active
 * and keyed by the record by its parent, so `defaultValues` always come
 * straight from the prop — no reset()-in-effect (see CLAUDE.md).
 * It's a <tr>, so there's no <form>: ✓ and Enter submit via handleSubmit.
 */
export function PaymentMethodRowForm({ paymentMethod, bankAccounts, onDone }: PaymentMethodRowFormProps) {
  const t = useTranslations('settings.paymentMethods');
  const tCommon = useTranslations('common');
  const createMutation = useCreatePaymentMethodMutation();
  const updateMutation = useUpdatePaymentMethodMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;
  // Built-in rows (Cash, Credit Card) can be renamed/relinked but not retyped.
  const typeLocked = Boolean(paymentMethod?.systemCode);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentMethodFormInput>({
    resolver: zodResolver(paymentMethodFormSchema),
    defaultValues: {
      name: paymentMethod?.name ?? '',
      type: paymentMethod?.type ?? '',
      bankAccountId: paymentMethod?.bankAccountId ?? '',
      description: paymentMethod?.description ?? '',
    },
  });

  const type = useWatch({ control, name: 'type' });
  const needsBankAccount = type !== '' && type !== PAYMENT_METHOD_TYPES.CASH;
  const accountLabel = (id: string) => {
    const account = bankAccounts.find((candidate) => candidate.id === id);
    return account ? bankAccountLabel(account) : undefined;
  };

  const submit = handleSubmit((values) => {
    const input = {
      name: values.name.trim(),
      type: values.type as PaymentMethodType,
      bankAccountId: values.type === PAYMENT_METHOD_TYPES.CASH ? null : values.bankAccountId,
      description: values.description.trim() || null,
    };
    if (paymentMethod) {
      updateMutation.mutate({ id: paymentMethod.id, input }, { onSuccess: onDone });
    } else {
      createMutation.mutate(input, { onSuccess: onDone });
    }
  });

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void submit();
    } else if (event.key === 'Escape') {
      onDone();
    }
  };

  const invalid = 'border-red-500 focus-visible:ring-red-500';

  return (
    <TableRow className="bg-brand-muted/30 hover:bg-brand-muted/30">
      <TableCell>
        <Input
          autoFocus
          placeholder={`* ${t('namePlaceholder')}`}
          aria-invalid={Boolean(errors.name)}
          className={cn(errors.name && invalid)}
          onKeyDown={onKeyDown}
          {...register('name')}
        />
      </TableCell>
      <TableCell>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={typeLocked}>
              <SelectTrigger className={cn(errors.type && invalid)}>
                <SelectValue placeholder={`* ${t('chooseType')}`}>
                  {field.value ? t(`types.${field.value}`) : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.values(PAYMENT_METHOD_TYPES).map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(`types.${value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </TableCell>
      <TableCell>
        {needsBankAccount && (
          <Controller
            control={control}
            name="bankAccountId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={cn(errors.bankAccountId && invalid)}>
                  <SelectValue placeholder={`* ${t('chooseLinkedAccount')}`}>
                    {field.value ? accountLabel(field.value) : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {bankAccountLabel(account)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}
      </TableCell>
      <TableCell>
        <Input placeholder={t('description')} onKeyDown={onKeyDown} {...register('description')} />
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => void submit()}
            disabled={isPending}
            aria-label={tCommon('save')}
            className="rounded-md p-1.5 text-brand hover:bg-brand-muted disabled:opacity-40"
          >
            <Check className="size-4" />
          </button>
          <button
            type="button"
            onClick={onDone}
            aria-label={tCommon('cancel')}
            className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
          >
            <X className="size-4" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
}
