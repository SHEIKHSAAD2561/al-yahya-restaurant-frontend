'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useCreateRoleMutation } from '../hooks/use-create-role-mutation';

const createRoleSchema = z.object({
  nameEn: z.string().min(1).max(100),
  nameAr: z.string().min(1).max(100),
});
type CreateRoleInput = z.infer<typeof createRoleSchema>;

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRoleDialog({ open, onOpenChange }: CreateRoleDialogProps) {
  const t = useTranslations('settings.roles');
  const tCommon = useTranslations('common');
  const createRoleMutation = useCreateRoleMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateRoleInput>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { nameEn: '', nameAr: '' },
  });

  function onSubmit(values: CreateRoleInput) {
    createRoleMutation.mutate(values, {
      onSuccess: () => {
        onOpenChange(false);
        reset();
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('createRole')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="roleNameEn">{t('roleNameEn')}</Label>
            <Input id="roleNameEn" {...register('nameEn')} />
            {errors.nameEn && <p className="text-sm text-red-600">{errors.nameEn.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="roleNameAr">{t('roleNameAr')}</Label>
            <Input id="roleNameAr" dir="rtl" {...register('nameAr')} />
            {errors.nameAr && <p className="text-sm text-red-600">{errors.nameAr.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={createRoleMutation.isPending}>
              {tCommon('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
