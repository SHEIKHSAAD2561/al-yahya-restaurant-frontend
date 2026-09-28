'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSuppliersQuery } from '@/features/suppliers/hooks/use-suppliers-query';
import { usePaymentMethodsQuery } from '@/features/payment-methods/hooks/use-payment-methods-query';
import { useCreateSupplierPaymentMutation } from '../hooks/use-create-supplier-payment-mutation';

const NO_METHOD = '__none__';

export function SupplierPaymentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations('supplierPayments');
  const tCommon = useTranslations('common');
  const suppliersQuery = useSuppliersQuery();
  const paymentMethodsQuery = usePaymentMethodsQuery();
  const createMutation = useCreateSupplierPaymentMutation();

  const [supplierId, setSupplierId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState(NO_METHOD);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  const amountValue = Number(amount);
  const canSave = Boolean(supplierId) && amount.trim() !== '' && Number.isFinite(amountValue) && amountValue > 0;

  function handleOpenChange(next: boolean) {
    if (!next) {
      setSupplierId('');
      setAmount('');
      setPaymentMethodId(NO_METHOD);
      setPaymentDate(new Date().toISOString().slice(0, 10));
      setNotes('');
    }
    onOpenChange(next);
  }

  function handleSubmit() {
    createMutation.mutate(
      {
        supplierId,
        amount: amountValue,
        paymentMethodId: paymentMethodId === NO_METHOD ? undefined : paymentMethodId,
        paymentDate,
        notes: notes.trim() || undefined,
      },
      { onSuccess: () => handleOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('recordPayment')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t('supplier')}</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectSupplier')}>
                  {suppliersQuery.data?.find((s) => s.id === supplierId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(suppliersQuery.data ?? []).map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name} ({supplier.balance.toFixed(2)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="paymentAmount">{t('amount')}</Label>
              <Input
                id="paymentAmount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="paymentDate">{t('date')}</Label>
              <Input id="paymentDate" type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t('paymentMethod')}</Label>
            <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
              <SelectTrigger>
                <SelectValue>
                  {paymentMethodId === NO_METHOD
                    ? t('none')
                    : paymentMethodsQuery.data?.find((m) => m.id === paymentMethodId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_METHOD}>{t('none')}</SelectItem>
                {(paymentMethodsQuery.data ?? []).map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="paymentNotes">{t('notes')}</Label>
            <Input id="paymentNotes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={255} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
            {tCommon('cancel')}
          </Button>
          <Button type="button" disabled={!canSave || createMutation.isPending} onClick={handleSubmit}>
            {tCommon('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
