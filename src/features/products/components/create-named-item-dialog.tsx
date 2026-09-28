'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CreateNamedItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  label: string;
  isPending: boolean;
  onCreate: (name: string) => void;
}

/** Tiny "name only" create dialog behind the Classification "+" buttons. */
export function CreateNamedItemDialog({
  open,
  onOpenChange,
  title,
  label,
  isPending,
  onCreate,
}: CreateNamedItemDialogProps) {
  const tCommon = useTranslations('common');
  const [name, setName] = useState('');

  function handleOpenChange(next: boolean) {
    if (!next) setName('');
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {/* Not a <form>: this dialog opens from inside the product <form>, and
            nested forms would submit the product. */}
        <div className="space-y-1.5">
          <Label htmlFor="namedItemName">{label}</Label>
          <Input
            id="namedItemName"
            autoFocus
            value={name}
            maxLength={100}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                if (name.trim()) onCreate(name.trim());
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
            {tCommon('cancel')}
          </Button>
          <Button type="button" disabled={!name.trim() || isPending} onClick={() => onCreate(name.trim())}>
            {tCommon('add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
