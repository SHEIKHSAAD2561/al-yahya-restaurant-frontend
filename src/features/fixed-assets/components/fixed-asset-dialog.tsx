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
import { useAccountsQuery } from '@/features/chart-of-accounts/hooks/use-accounts-query';
import { useLocationsQuery } from '@/features/locations/hooks/use-locations-query';
import { useSaveFixedAssetMutation } from '../hooks/use-fixed-asset-mutations';
import type { FixedAsset } from '../types/fixed-asset';

const NO_LOCATION = '__none__';
const NO_PAYMENT = '__none__';

interface FixedAssetDialogProps {
  asset: FixedAsset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FixedAssetDialog({ asset, open, onOpenChange }: FixedAssetDialogProps) {
  const t = useTranslations('fixedAssets');
  const tCommon = useTranslations('common');
  const assetAccountsQuery = useAccountsQuery({ type: 'ASSET' });
  const expenseAccountsQuery = useAccountsQuery({ type: 'EXPENSE' });
  const locationsQuery = useLocationsQuery();
  const saveMutation = useSaveFixedAssetMutation(asset?.id);

  const [name, setName] = useState(asset?.name ?? '');
  const [category, setCategory] = useState(asset?.category ?? '');
  const [locationId, setLocationId] = useState(asset?.locationId ?? NO_LOCATION);
  const [assetAccountId, setAssetAccountId] = useState(asset?.assetAccountId ?? '');
  const [accumulatedDepreciationAccountId, setAccumulatedDepreciationAccountId] = useState(
    asset?.accumulatedDepreciationAccountId ?? '',
  );
  const [depreciationExpenseAccountId, setDepreciationExpenseAccountId] = useState(
    asset?.depreciationExpenseAccountId ?? '',
  );
  const [purchaseDate, setPurchaseDate] = useState(asset?.purchaseDate ?? new Date().toISOString().slice(0, 10));
  const [purchaseCost, setPurchaseCost] = useState(asset ? String(asset.purchaseCost) : '');
  const [usefulLifeMonths, setUsefulLifeMonths] = useState(asset ? String(asset.usefulLifeMonths) : '12');
  const [salvageValue, setSalvageValue] = useState(asset ? String(asset.salvageValue) : '0');
  const [paymentAccountId, setPaymentAccountId] = useState(NO_PAYMENT);
  const [notes, setNotes] = useState(asset?.notes ?? '');

  const assetAccounts = assetAccountsQuery.data ?? [];
  const expenseAccounts = expenseAccountsQuery.data ?? [];

  const canSave =
    name.trim().length > 0 &&
    Boolean(assetAccountId) &&
    Boolean(accumulatedDepreciationAccountId) &&
    Boolean(depreciationExpenseAccountId) &&
    Number(purchaseCost) > 0 &&
    Number(usefulLifeMonths) > 0;

  function handleSubmit() {
    if (asset) {
      saveMutation.mutate(
        {
          name: name.trim(),
          category: category.trim() || undefined,
          locationId: locationId === NO_LOCATION ? null : locationId,
          assetAccountId,
          accumulatedDepreciationAccountId,
          depreciationExpenseAccountId,
          usefulLifeMonths: Number(usefulLifeMonths),
          salvageValue: Number(salvageValue),
          notes: notes.trim() || undefined,
        },
        { onSuccess: () => onOpenChange(false) },
      );
      return;
    }
    saveMutation.mutate(
      {
        name: name.trim(),
        category: category.trim() || undefined,
        locationId: locationId === NO_LOCATION ? undefined : locationId,
        assetAccountId,
        accumulatedDepreciationAccountId,
        depreciationExpenseAccountId,
        purchaseDate,
        purchaseCost: Number(purchaseCost),
        usefulLifeMonths: Number(usefulLifeMonths),
        salvageValue: Number(salvageValue),
        paymentAccountId: paymentAccountId === NO_PAYMENT ? undefined : paymentAccountId,
        notes: notes.trim() || undefined,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{asset ? t('editAsset') : t('newAsset')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="assetName">{t('name')}</Label>
              <Input id="assetName" value={name} onChange={(event) => setName(event.target.value)} maxLength={150} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assetCategory">{t('category')}</Label>
              <Input id="assetCategory" value={category} onChange={(event) => setCategory(event.target.value)} maxLength={100} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t('location')}</Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger>
                <SelectValue>
                  {locationId === NO_LOCATION ? t('noLocation') : locationsQuery.data?.find((l) => l.id === locationId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_LOCATION}>{t('noLocation')}</SelectItem>
                {(locationsQuery.data ?? []).map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="purchaseDate">{t('purchaseDate')}</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={purchaseDate}
                onChange={(event) => setPurchaseDate(event.target.value)}
                disabled={Boolean(asset)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="purchaseCost">{t('purchaseCost')}</Label>
              <Input
                id="purchaseCost"
                type="number"
                min="0.01"
                step="0.01"
                value={purchaseCost}
                onChange={(event) => setPurchaseCost(event.target.value)}
                disabled={Boolean(asset)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="usefulLifeMonths">{t('usefulLifeMonths')}</Label>
              <Input
                id="usefulLifeMonths"
                type="number"
                min="1"
                step="1"
                value={usefulLifeMonths}
                onChange={(event) => setUsefulLifeMonths(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="salvageValue">{t('salvageValue')}</Label>
              <Input
                id="salvageValue"
                type="number"
                min="0"
                step="0.01"
                value={salvageValue}
                onChange={(event) => setSalvageValue(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t('assetAccount')}</Label>
            <Select value={assetAccountId} onValueChange={setAssetAccountId}>
              <SelectTrigger>
                <SelectValue>
                  {(() => {
                    const account = assetAccounts.find((a) => a.id === assetAccountId);
                    return account ? `${account.code} — ${account.name}` : undefined;
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {assetAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.code} — {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>{t('accumulatedDepreciationAccount')}</Label>
            <Select value={accumulatedDepreciationAccountId} onValueChange={setAccumulatedDepreciationAccountId}>
              <SelectTrigger>
                <SelectValue>
                  {(() => {
                    const account = assetAccounts.find((a) => a.id === accumulatedDepreciationAccountId);
                    return account ? `${account.code} — ${account.name}` : undefined;
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {assetAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.code} — {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>{t('depreciationExpenseAccount')}</Label>
            <Select value={depreciationExpenseAccountId} onValueChange={setDepreciationExpenseAccountId}>
              <SelectTrigger>
                <SelectValue>
                  {(() => {
                    const account = expenseAccounts.find((a) => a.id === depreciationExpenseAccountId);
                    return account ? `${account.code} — ${account.name}` : undefined;
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {expenseAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.code} — {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!asset && (
            <div className="space-y-1.5">
              <Label>{t('paymentAccount')}</Label>
              <Select value={paymentAccountId} onValueChange={setPaymentAccountId}>
                <SelectTrigger>
                  <SelectValue>
                    {paymentAccountId === NO_PAYMENT
                      ? t('noJournalEntry')
                      : (() => {
                          const account = assetAccounts.find((a) => a.id === paymentAccountId);
                          return account ? `${account.code} — ${account.name}` : undefined;
                        })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PAYMENT}>{t('noJournalEntry')}</SelectItem>
                  {assetAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.code} — {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-zinc-500">{t('paymentAccountHint')}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="assetNotes">{t('notes')}</Label>
            <Input id="assetNotes" value={notes} onChange={(event) => setNotes(event.target.value)} />
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
