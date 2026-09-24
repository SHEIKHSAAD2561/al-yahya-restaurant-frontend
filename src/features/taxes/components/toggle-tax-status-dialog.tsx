'use client';

import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUpdateTaxStatusMutation } from '../hooks/use-update-tax-status-mutation';
import type { Tax } from '../types/tax';

interface ToggleTaxStatusDialogProps {
  tax: Tax | null;
  onOpenChange: (open: boolean) => void;
}

export function ToggleTaxStatusDialog({ tax, onOpenChange }: ToggleTaxStatusDialogProps) {
  const t = useTranslations('settings.taxes');
  const tCommon = useTranslations('common');
  const updateStatusMutation = useUpdateTaxStatusMutation();

  const activating = tax ? !tax.isActive : true;

  function handleConfirm() {
    if (!tax) return;
    updateStatusMutation.mutate(
      { id: tax.id, isActive: !tax.isActive },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={tax !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {activating ? t('activateTaxTitle', { name: tax?.name ?? '' }) : t('deactivateTaxTitle', { name: tax?.name ?? '' })}
          </DialogTitle>
          <DialogDescription>
            {activating ? t('activateTaxDescription') : t('deactivateTaxDescription')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {tCommon('cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={updateStatusMutation.isPending}>
            {activating ? t('activate') : t('deactivate')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
