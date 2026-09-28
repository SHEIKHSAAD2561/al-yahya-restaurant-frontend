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
import { useLocationsQuery } from '@/features/locations/hooks/use-locations-query';
import { useSaveExpenseMutation } from '../hooks/use-save-expense-mutation';
import { EXPENSE_CATEGORIES, type ExpenseCategory, type ExpenseListItem } from '../types/expense';

const NO_LOCATION = '__none__';

interface ExpenseDialogProps {
  /** null closes the dialog; `undefined` for create, an `ExpenseListItem` for edit. */
  open: boolean;
  expense: ExpenseListItem | null;
  onOpenChange: (open: boolean) => void;
}

/** Keyed by `expense?.id` from the parent, so switching between "Add" and
 * editing a different row always builds fresh `defaultValues` — no `reset()`
 * (same convention as every other form in this codebase). */
export function ExpenseDialog({ open, expense, onOpenChange }: ExpenseDialogProps) {
  const t = useTranslations('expenses');
  const tCommon = useTranslations('common');
  const locationsQuery = useLocationsQuery();
  const saveMutation = useSaveExpenseMutation(expense?.id);

  const [category, setCategory] = useState<ExpenseCategory>(expense?.category ?? EXPENSE_CATEGORIES.OTHER);
  const [description, setDescription] = useState(expense?.description ?? '');
  const [amount, setAmount] = useState(expense?.amount?.toString() ?? '');
  const [locationId, setLocationId] = useState(expense?.locationId ?? NO_LOCATION);
  const [expenseDate, setExpenseDate] = useState(expense?.expenseDate ?? new Date().toISOString().slice(0, 10));

  const amountValue = Number(amount);
  const canSave = description.trim() !== '' && amount.trim() !== '' && Number.isFinite(amountValue) && amountValue >= 0;

  function handleSubmit() {
    saveMutation.mutate(
      {
        category,
        description: description.trim(),
        amount: amountValue,
        locationId: locationId === NO_LOCATION ? null : locationId,
        expenseDate,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{expense ? t('editExpense') : t('addExpense')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t('category')}</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as ExpenseCategory)}>
              <SelectTrigger>
                <SelectValue>{t(`categories.${category}`)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.values(EXPENSE_CATEGORIES).map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(`categories.${value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="expenseDescription">{t('description')}</Label>
            <Input
              id="expenseDescription"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={255}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="expenseAmount">{t('amount')}</Label>
              <Input
                id="expenseAmount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expenseDate">{t('date')}</Label>
              <Input
                id="expenseDate"
                type="date"
                value={expenseDate}
                onChange={(event) => setExpenseDate(event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t('location')}</Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger>
                <SelectValue>
                  {locationId === NO_LOCATION
                    ? t('allLocationsExpense')
                    : locationsQuery.data?.find((l) => l.id === locationId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_LOCATION}>{t('allLocationsExpense')}</SelectItem>
                {(locationsQuery.data ?? []).map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
