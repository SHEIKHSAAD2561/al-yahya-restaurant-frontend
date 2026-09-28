'use client';

import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useCompanyBrandingQuery } from '@/features/company/hooks/use-company-branding-query';
import { useUpdateReceiptSettingsMutation } from '../hooks/use-update-receipt-settings-mutation';
import { useUploadCommentImageMutation, useRemoveCommentImageMutation } from '../hooks/use-comment-image-mutations';
import {
  RECEIPT_LANGUAGES,
  RECEIPT_PRINT_LAYOUTS,
  RECEIPT_TOGGLE_SECTIONS,
  type ReceiptSettings,
  type ReceiptSettingsInput,
} from '../types/receipt-settings';
import { dummyReceiptSaleData } from '../types/receipt-sale-data';
import { ReceiptDocument } from './receipt-document';

function toInput(settings: ReceiptSettings): ReceiptSettingsInput {
  return {
    showLogo: settings.showLogo,
    showCompanyName: settings.showCompanyName,
    showCompanyAddress: settings.showCompanyAddress,
    showCompanyPhone: settings.showCompanyPhone,
    showVatNumber: settings.showVatNumber,
    showCrNumber: settings.showCrNumber,
    showSku: settings.showSku,
    showBarcode: settings.showBarcode,
    showQuantity: settings.showQuantity,
    showUnitPrice: settings.showUnitPrice,
    showDiscount: settings.showDiscount,
    showTaxPerLine: settings.showTaxPerLine,
    showSubtotal: settings.showSubtotal,
    showTaxSummary: settings.showTaxSummary,
    showTotal: settings.showTotal,
    showAmountPaid: settings.showAmountPaid,
    showChangeDue: settings.showChangeDue,
    showPaymentMethod: settings.showPaymentMethod,
    showCashierName: settings.showCashierName,
    showCustomerName: settings.showCustomerName,
    showQrCode: settings.showQrCode,
    showThankYouNote: settings.showThankYouNote,
    salesNote: settings.salesNote,
    printLayout: settings.printLayout,
    language: settings.language,
  };
}

const SECTION_TITLES = {
  header: 'sectionHeader',
  items: 'sectionItems',
  footer: 'sectionFooter',
} as const;

/** Same plain-`useState` reasoning as `SalesTab` — no react-hook-form, no
 * `reset()`, keyed by `settings.updatedAt` from the parent. */
export function ReceiptsTab({ settings }: { settings: ReceiptSettings }) {
  const t = useTranslations('saleSettings');
  const brandingQuery = useCompanyBrandingQuery();
  const [draft, setDraft] = useState<ReceiptSettingsInput>(() => toInput(settings));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateMutation = useUpdateReceiptSettingsMutation();
  const uploadMutation = useUploadCommentImageMutation();
  const removeMutation = useRemoveCommentImageMutation();

  const saved = toInput(settings);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);

  function toggle(key: keyof ReceiptSettingsInput) {
    setDraft((current) => ({ ...current, [key]: !current[key] }));
  }

  const previewSettings: ReceiptSettings = { ...settings, ...draft };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-zinc-900">{t('template')}</h2>
          <Select value="default" disabled>
            <SelectTrigger className="w-64">
              <SelectValue>{t('defaultTemplate')}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">{t('defaultTemplate')}</SelectItem>
            </SelectContent>
          </Select>
          <p className="mt-2 text-xs text-zinc-500">{t('onlyOneTemplate')}</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-zinc-900">{t('receiptContentEditor')}</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {(Object.keys(RECEIPT_TOGGLE_SECTIONS) as (keyof typeof RECEIPT_TOGGLE_SECTIONS)[]).map((section) => (
              <div key={section} className="space-y-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {t(SECTION_TITLES[section])}
                </h3>
                {RECEIPT_TOGGLE_SECTIONS[section].map((key) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-zinc-700">
                    <Checkbox checked={draft[key]} onCheckedChange={() => toggle(key)} />
                    {t(`receiptToggles.${key}`)}
                  </label>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-1.5">
            <Label htmlFor="salesNote">{t('salesNote')}</Label>
            <Input
              id="salesNote"
              value={draft.salesNote ?? ''}
              maxLength={500}
              onChange={(event) => setDraft((current) => ({ ...current, salesNote: event.target.value || null }))}
              placeholder={t('salesNotePlaceholder')}
            />
          </div>

          <div className="mt-4 space-y-1.5">
            <Label>{t('commentImage')}</Label>
            <div className="flex items-center gap-3">
              {settings.commentImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- small settings-page thumbnail
                <img src={settings.commentImageUrl} alt="" className="h-12 w-12 rounded-md border border-zinc-200 object-contain" />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) uploadMutation.mutate(file);
                  event.target.value = '';
                }}
              />
              <Button type="button" variant="outline" disabled={uploadMutation.isPending} onClick={() => fileInputRef.current?.click()}>
                <Upload className="size-4" />
                {t('uploadImage')}
              </Button>
              {settings.commentImageUrl && (
                <Button type="button" variant="ghost" disabled={removeMutation.isPending} onClick={() => removeMutation.mutate()}>
                  <X className="size-4" />
                  {t('remove')}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-zinc-900">{t('printLayout')}</h2>
          <div className="grid max-w-xs grid-cols-2 gap-2">
            {Object.values(RECEIPT_PRINT_LAYOUTS).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setDraft((current) => ({ ...current, printLayout: value }))}
                className={cn(
                  'rounded-lg border py-2 text-sm font-medium transition-colors',
                  draft.printLayout === value ? 'border-brand bg-brand-muted text-brand' : 'border-zinc-200 text-zinc-600',
                )}
              >
                {t(`printLayouts.${value}`)}
              </button>
            ))}
          </div>

          <h2 className="mb-4 mt-6 text-base font-semibold text-zinc-900">{t('language')}</h2>
          <div className="grid max-w-xs grid-cols-2 gap-2">
            {Object.values(RECEIPT_LANGUAGES).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setDraft((current) => ({ ...current, language: value }))}
                className={cn(
                  'rounded-lg border py-2 text-sm font-medium transition-colors',
                  draft.language === value ? 'border-brand bg-brand-muted text-brand' : 'border-zinc-200 text-zinc-600',
                )}
              >
                {t(`languages.${value}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" disabled={!isDirty} onClick={() => setDraft(saved)}>
            {t('discard')}
          </Button>
          <Button type="button" disabled={!isDirty || updateMutation.isPending} onClick={() => updateMutation.mutate(draft)}>
            {t('save')}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{t('livePreview')}</h3>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          {brandingQuery.data && (
            <ReceiptDocument settings={previewSettings} branding={brandingQuery.data} sale={dummyReceiptSaleData()} />
          )}
        </div>
      </div>
    </div>
  );
}
