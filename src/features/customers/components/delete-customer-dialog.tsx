'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DeleteCustomerDialogProps {
  customer: { id: string; name: string } | null;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteCustomerDialog({ customer, isPending, onOpenChange, onConfirm }: DeleteCustomerDialogProps) {
  const t = useTranslations('customers');
  const tCommon = useTranslations('common');

  return (
    <Dialog open={customer !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('deleteTitle', { name: customer?.name ?? '' })}</DialogTitle>
          <DialogDescription>{t('deleteDescription')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {tCommon('cancel')}
          </Button>
          <Button variant="destructive" disabled={isPending} onClick={onConfirm}>
            {tCommon('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
