'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccountsQuery } from '../hooks/use-accounts-query';
import { useSaveAccountMutation } from '../hooks/use-account-mutations';
import { ACCOUNT_TYPES, type Account, type AccountType } from '../types/account';

const NO_PARENT = '__none__';

interface AccountDialogProps {
  account: Account | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountDialog({ account, open, onOpenChange }: AccountDialogProps) {
  const t = useTranslations('chartOfAccounts');
  const tCommon = useTranslations('common');
  const accountsQuery = useAccountsQuery();
  const saveMutation = useSaveAccountMutation(account?.id);

  const [code, setCode] = useState(account?.code ?? '');
  const [name, setName] = useState(account?.name ?? '');
  const [type, setType] = useState<AccountType>(account?.type ?? ACCOUNT_TYPES.ASSET);
  const [parentId, setParentId] = useState(account?.parentId ?? NO_PARENT);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setCode('');
      setName('');
      setType(ACCOUNT_TYPES.ASSET);
      setParentId(NO_PARENT);
    }
    onOpenChange(next);
  }

  const canSave = code.trim().length > 0 && name.trim().length > 0;

  function handleSubmit() {
    saveMutation.mutate(
      { code: code.trim(), name: name.trim(), type, parentId: parentId === NO_PARENT ? null : parentId },
      { onSuccess: () => handleOpenChange(false) },
    );
  }

  const parentCandidates = (accountsQuery.data ?? []).filter((a) => a.id !== account?.id);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{account ? t('editAccount') : t('newAccount')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="accountCode">{t('code')}</Label>
              <Input id="accountCode" value={code} onChange={(event) => setCode(event.target.value)} maxLength={20} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('type')}</Label>
              <Select value={type} onValueChange={(value) => setType(value as AccountType)} disabled={Boolean(account)}>
                <SelectTrigger>
                  <SelectValue>{t(`types.${type}`)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ACCOUNT_TYPES).map((value) => (
                    <SelectItem key={value} value={value}>
                      {t(`types.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="accountName">{t('name')}</Label>
            <Input id="accountName" value={name} onChange={(event) => setName(event.target.value)} maxLength={150} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('parentAccount')}</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger>
                <SelectValue>
                  {parentId === NO_PARENT ? t('noParent') : parentCandidates.find((a) => a.id === parentId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PARENT}>{t('noParent')}</SelectItem>
                {parentCandidates.map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    {candidate.code} — {candidate.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
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
