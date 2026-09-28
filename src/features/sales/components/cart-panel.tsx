'use client';

import { useState } from 'react';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { usePermission } from '@/core/permissions/session-context';
import { PERMISSIONS } from '@/core/permissions/codes';
import { NoteDialog } from './note-dialog';
import { DiscountDialog } from './discount-dialog';
import type { CartLine } from '../types/cart';
import type { DiscountType } from '../types/sale';

interface CartPanelProps {
  lines: CartLine[];
  onQuantityChange: (variantId: string, quantity: number) => void;
  onRemove: (variantId: string) => void;
  note: string;
  onNoteChange: (note: string) => void;
  discountType: DiscountType | null;
  discountValue: number | null;
  onDiscountChange: (type: DiscountType | null, value: number | null) => void;
  taxStatusLabel: string;
  onPay: () => void;
}

export function CartPanel({
  lines,
  onQuantityChange,
  onRemove,
  note,
  onNoteChange,
  discountType,
  discountValue,
  onDiscountChange,
  taxStatusLabel,
  onPay,
}: CartPanelProps) {
  const t = useTranslations('sellScreen');
  const canRemoveItems = usePermission(PERMISSIONS.POS_REMOVE_CART_ITEMS);
  const canDiscount = usePermission(PERMISSIONS.POS_EDIT_PRICES_DISCOUNTS);
  const [noteOpen, setNoteOpen] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white">
      <div className="flex-1 overflow-y-auto p-3">
        {lines.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-zinc-400">
            <ShoppingCart className="size-10" />
            <p className="text-sm">{t('emptyCart')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lines.map((line) => (
              <div key={line.variantId} className="flex items-center gap-2 border-b border-zinc-100 pb-3 last:border-0">
                {canRemoveItems && (
                  <button
                    type="button"
                    onClick={() => onRemove(line.variantId)}
                    aria-label={t('removeItem')}
                    className="shrink-0 rounded-md p-1 text-zinc-300 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
                <span className="flex-1 truncate text-sm font-medium text-zinc-900">{line.name}</span>
                <div className="w-20 shrink-0">
                  <p className="mb-0.5 text-[10px] text-zinc-400">{t('quantity')}</p>
                  <Input
                    type="number"
                    step="1"
                    min="1"
                    value={line.quantity}
                    onChange={(event) => onQuantityChange(line.variantId, Math.max(1, Number(event.target.value) || 1))}
                    className="h-8 text-sm"
                  />
                </div>
                <span className="w-16 shrink-0 text-end text-sm font-semibold text-zinc-900">
                  {(line.unitPrice * line.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-zinc-100 p-3">
        <div className="mb-2 flex items-center justify-between text-sm">
          {canDiscount && (
            <div className="flex gap-3">
              <button type="button" onClick={() => setNoteOpen(true)} className="font-medium text-brand hover:underline">
                {note ? t('editNote') : t('addNote')}
              </button>
              <button type="button" onClick={() => setDiscountOpen(true)} className="font-medium text-brand hover:underline">
                {discountType ? t('editDiscount') : t('addDiscount')}
              </button>
            </div>
          )}
        </div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-zinc-500">
            {t('total')} <span className="text-xs">({taxStatusLabel})</span>
          </span>
          <span className="text-lg font-semibold text-zinc-900">{subtotal.toFixed(2)}</span>
        </div>
        <button
          type="button"
          disabled={lines.length === 0}
          onClick={onPay}
          className="flex w-full items-center justify-between rounded-lg bg-brand px-4 py-3 font-semibold text-brand-foreground disabled:opacity-40"
        >
          <span>{t('payItems', { count: itemCount })}</span>
          <span>{subtotal.toFixed(2)}</span>
        </button>
      </div>

      <NoteDialog open={noteOpen} onOpenChange={setNoteOpen} value={note} onSave={onNoteChange} />
      <DiscountDialog
        open={discountOpen}
        onOpenChange={setDiscountOpen}
        type={discountType}
        value={discountValue}
        onSave={onDiscountChange}
      />
    </div>
  );
}
