'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onSave: (note: string) => void;
}

export function NoteDialog({ open, onOpenChange, value, onSave }: NoteDialogProps) {
  const t = useTranslations('sellScreen');
  const tCommon = useTranslations('common');
  const [draft, setDraft] = useState(value);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(value);
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('saleNote')}</DialogTitle>
        </DialogHeader>
        <textarea
          autoFocus
          rows={3}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={500}
          className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {tCommon('cancel')}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onSave(draft.trim());
              onOpenChange(false);
            }}
          >
            {tCommon('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
