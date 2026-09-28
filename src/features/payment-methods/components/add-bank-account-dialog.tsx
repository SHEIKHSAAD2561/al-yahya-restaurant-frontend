'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateBankAccountMutation } from '../hooks/use-create-bank-account-mutation';
import { bankAccountFormSchema, type BankAccountFormInput } from '../schemas/payment-method.schema';

interface AddBankAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddBankAccountDialog({ open, onOpenChange }: AddBankAccountDialogProps) {
  const t = useTranslations('settings.paymentMethods');
  const tCommon = useTranslations('common');
  const createMutation = useCreateBankAccountMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BankAccountFormInput>({
    resolver: zodResolver(bankAccountFormSchema),
    defaultValues: { name: '', accountNumber: '' },
  });

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function onSubmit(values: BankAccountFormInput) {
    createMutation.mutate(
      { name: values.name.trim(), accountNumber: values.accountNumber.trim() },
      { onSuccess: () => handleOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('addNewBank')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="bankAccountName">
              <span className="text-red-600">*</span> {t('bankAccountName')}
            </Label>
            <Input id="bankAccountName" aria-invalid={Boolean(errors.name)} {...register('name')} />
            {errors.name && <p className="text-sm text-red-600">{t('required')}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bankAccountNumber">
              <span className="text-red-600">*</span> {t('bankAccountNumber')}
            </Label>
            <Input
              id="bankAccountNumber"
              dir="ltr"
              aria-invalid={Boolean(errors.accountNumber)}
              {...register('accountNumber')}
            />
            {errors.accountNumber && <p className="text-sm text-red-600">{t('required')}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {tCommon('add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
