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
import { useSaveSupplierMutation } from '../hooks/use-save-supplier-mutation';
import type { Supplier } from '../types/supplier';

interface SupplierDialogProps {
  open: boolean;
  supplier: Supplier | null;
  onOpenChange: (open: boolean) => void;
}

/** Keyed by `supplier?.id ?? 'new'` from the parent — same keyed-remount rule
 * as every other add/edit dialog in this codebase. */
export function SupplierDialog({ open, supplier, onOpenChange }: SupplierDialogProps) {
  const t = useTranslations('suppliers');
  const tCommon = useTranslations('common');
  const saveMutation = useSaveSupplierMutation(supplier?.id);

  const [name, setName] = useState(supplier?.name ?? '');
  const [phone, setPhone] = useState(supplier?.phone ?? '');
  const [email, setEmail] = useState(supplier?.email ?? '');
  const [vatNumber, setVatNumber] = useState(supplier?.vatNumber ?? '');
  const [address, setAddress] = useState(supplier?.address ?? '');

  const canSave = name.trim() !== '';

  function handleSubmit() {
    saveMutation.mutate(
      {
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        vatNumber: vatNumber.trim() || undefined,
        address: address.trim() || undefined,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{supplier ? t('editSupplier') : t('addSupplier')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="supplierName">{t('name')}</Label>
            <Input id="supplierName" value={name} onChange={(event) => setName(event.target.value)} maxLength={150} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="supplierPhone">{t('phone')}</Label>
              <Input id="supplierPhone" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="supplierEmail">{t('email')}</Label>
              <Input id="supplierEmail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="supplierVat">{t('vatNumber')}</Label>
            <Input id="supplierVat" value={vatNumber} onChange={(event) => setVatNumber(event.target.value)} maxLength={15} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="supplierAddress">{t('address')}</Label>
            <Input id="supplierAddress" value={address} onChange={(event) => setAddress(event.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {tCommon('cancel')}
          </Button>
          <Button type="button" disabled={!canSave || saveMutation.isPending} onClick={handleSubmit}>
            {tCommon('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
