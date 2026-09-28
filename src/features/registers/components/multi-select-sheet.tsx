'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface MultiSelectItem {
  id: string;
  label: string;
}

interface MultiSelectSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  items: MultiSelectItem[];
  selectedIds: string[];
  onApply: (ids: string[]) => void;
}

/** A generic "pick several of these" panel — used for both Assigned Cashiers
 * and Payment Methods on the register settings form. Local draft state so
 * Cancel discards without touching the form until "Done". */
export function MultiSelectSheet({ open, onOpenChange, title, items, selectedIds, onApply }: MultiSelectSheetProps) {
  const tCommon = useTranslations('common');
  const [draft, setDraft] = useState<Set<string>>(new Set(selectedIds));
  const [search, setSearch] = useState('');
  // "Adjust state during render" (react.dev) instead of an effect — re-seeds
  // the draft from the committed selection each time the sheet opens, without
  // an extra render pass.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(new Set(selectedIds));
  }

  const visibleItems = items.filter((item) => item.label.toLowerCase().includes(search.trim().toLowerCase()));

  function toggle(id: string) {
    setDraft((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-sm">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <SheetBody className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} className="ps-9" />
          </div>
          <div className="space-y-1">
            {visibleItems.map((item) => (
              <label
                key={item.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-zinc-50"
              >
                <Checkbox checked={draft.has(item.id)} onCheckedChange={() => toggle(item.id)} />
                {item.label}
              </label>
            ))}
          </div>
        </SheetBody>
        <SheetFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {tCommon('cancel')}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onApply([...draft]);
              onOpenChange(false);
            }}
          >
            {tCommon('done')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
