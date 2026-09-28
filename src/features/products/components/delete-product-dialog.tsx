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
import { useDeleteProductMutation } from '../hooks/use-delete-product-mutation';

interface DeleteProductDialogProps {
  /** The main product (all of its variants go with it). */
  product: { id: string; name: string } | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteProductDialog({ product, onOpenChange }: DeleteProductDialogProps) {
  const t = useTranslations('products');
  const tCommon = useTranslations('common');
  const deleteMutation = useDeleteProductMutation();

  return (
    <Dialog open={product !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('deleteTitle', { name: product?.name ?? '' })}</DialogTitle>
          <DialogDescription>{t('deleteDescription')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {tCommon('cancel')}
          </Button>
          <Button
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={() =>
              product && deleteMutation.mutate(product.id, { onSuccess: () => onOpenChange(false) })
            }
          >
            {tCommon('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
