'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useUpdateSaleSettingsMutation } from '../hooks/use-update-sale-settings-mutation';
import type { SaleSettings, SaleSettingsInput } from '../types/sale-settings';

const TOGGLE_KEYS = [
  'allowSalesman',
  'allowQuotation',
  'activateKitchenTicket',
  'sellWhenQuantityZeroOrBelow',
  'sellBelowCost',
  'taxableInvoiceB2b',
  'numberDialog',
  'enableWhatsappMessages',
] as const satisfies readonly (keyof SaleSettingsInput)[];

function toInput(settings: SaleSettings): SaleSettingsInput {
  return {
    allowSalesman: settings.allowSalesman,
    allowQuotation: settings.allowQuotation,
    activateKitchenTicket: settings.activateKitchenTicket,
    sellWhenQuantityZeroOrBelow: settings.sellWhenQuantityZeroOrBelow,
    sellBelowCost: settings.sellBelowCost,
    taxableInvoiceB2b: settings.taxableInvoiceB2b,
    numberDialog: settings.numberDialog,
    enableWhatsappMessages: settings.enableWhatsappMessages,
  };
}

/**
 * A plain `useState` form (not react-hook-form) keyed by `settings.updatedAt`
 * from the parent — every field here is an independent boolean toggle with
 * no cross-field validation, so there's nothing react-hook-form buys over
 * local state, and it sidesteps the Controller/reset gotcha entirely (see
 * CLAUDE.md) since there's no `reset()` call at all.
 */
export function SalesTab({ settings }: { settings: SaleSettings }) {
  const t = useTranslations('saleSettings');
  const [draft, setDraft] = useState<SaleSettingsInput>(() => toInput(settings));
  const mutation = useUpdateSaleSettingsMutation();

  const saved = toInput(settings);
  const isDirty = TOGGLE_KEYS.some((key) => draft[key] !== saved[key]);

  return (
    <div className="max-w-2xl space-y-1 rounded-2xl border border-zinc-200 bg-white p-6">
      {TOGGLE_KEYS.map((key) => (
        <label
          key={key}
          className="flex items-center justify-between gap-4 border-b border-zinc-100 py-3.5 last:border-b-0"
        >
          <span className="text-sm font-medium text-zinc-800">{t(`toggles.${key}`)}</span>
          <Switch
            checked={draft[key]}
            onCheckedChange={(checked) => setDraft((current) => ({ ...current, [key]: checked }))}
          />
        </label>
      ))}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" disabled={!isDirty} onClick={() => setDraft(saved)}>
          {t('discard')}
        </Button>
        <Button
          type="button"
          disabled={!isDirty || mutation.isPending}
          onClick={() => mutation.mutate(draft)}
        >
          {t('save')}
        </Button>
      </div>
    </div>
  );
}
