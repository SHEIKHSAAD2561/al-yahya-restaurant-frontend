'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useRouter } from '@/core/i18n/navigation';
import { useSavePromotionMutation } from '../hooks/use-save-promotion-mutation';
import { LocationTargeting } from './location-targeting';
import { ScheduleFields } from './schedule-fields';
import { TargetPicker } from './target-picker';
import { DiscountFields } from './discount-fields';
import {
  PROMOTION_TARGET_TYPES,
  PROMOTION_TYPES,
  type Promotion,
  type PromotionDiscountType,
  type PromotionTargetType,
  type PromotionType,
} from '../types/promotion';
import type { PromotionInput } from '../api/promotions.api';

interface PromotionFormPageProps {
  type: PromotionType;
  promotion?: Promotion;
}

export function PromotionFormPage({ type, promotion }: PromotionFormPageProps) {
  const t = useTranslations('promotions');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const saveMutation = useSavePromotionMutation(promotion?.id);

  const [name, setName] = useState(promotion?.name ?? '');
  const [startAt, setStartAt] = useState(promotion?.startAt ?? new Date().toISOString());
  const [endAt, setEndAt] = useState<string | null>(promotion?.endAt ?? null);
  const [applyToAllLocations, setApplyToAllLocations] = useState(promotion?.applyToAllLocations ?? true);
  const [locationIds, setLocationIds] = useState<string[]>(promotion?.locationIds ?? []);

  // Discount off Products
  const [targetType, setTargetType] = useState<PromotionTargetType | undefined>(
    promotion?.targetType ?? PROMOTION_TARGET_TYPES.ALL_PRODUCTS,
  );
  const [targetVariantIds, setTargetVariantIds] = useState<string[]>(promotion?.targetVariantIds ?? []);
  const [targetCategoryIds, setTargetCategoryIds] = useState<string[]>(promotion?.targetCategoryIds ?? []);
  const [discountType, setDiscountType] = useState<PromotionDiscountType | undefined>(
    promotion?.discountType ?? undefined,
  );
  const [discountValue, setDiscountValue] = useState<number | undefined>(promotion?.discountValue ?? undefined);

  // Buy X Get Y
  const [buyQuantity, setBuyQuantity] = useState<number | undefined>(promotion?.buyQuantity ?? undefined);
  const [buyTargetType, setBuyTargetType] = useState<PromotionTargetType | undefined>(
    promotion?.buyTargetType ?? PROMOTION_TARGET_TYPES.ALL_PRODUCTS,
  );
  const [buyVariantIds, setBuyVariantIds] = useState<string[]>(promotion?.buyVariantIds ?? []);
  const [buyCategoryIds, setBuyCategoryIds] = useState<string[]>(promotion?.buyCategoryIds ?? []);
  const [getQuantity, setGetQuantity] = useState<number | undefined>(promotion?.getQuantity ?? undefined);
  const [getTargetType, setGetTargetType] = useState<PromotionTargetType | undefined>(
    promotion?.getTargetType ?? PROMOTION_TARGET_TYPES.ALL_PRODUCTS,
  );
  const [getVariantIds, setGetVariantIds] = useState<string[]>(promotion?.getVariantIds ?? []);
  const [getCategoryIds, setGetCategoryIds] = useState<string[]>(promotion?.getCategoryIds ?? []);
  const [getDiscountType, setGetDiscountType] = useState<PromotionDiscountType | undefined>(
    promotion?.getDiscountType ?? undefined,
  );
  const [getDiscountValue, setGetDiscountValue] = useState<number | undefined>(promotion?.getDiscountValue ?? undefined);

  const isDiscountType = type === PROMOTION_TYPES.DISCOUNT_OFF_PRODUCTS;

  const canSave =
    name.trim() !== '' &&
    (applyToAllLocations || locationIds.length > 0) &&
    (isDiscountType
      ? discountType !== undefined &&
        discountValue !== undefined &&
        (targetType !== PROMOTION_TARGET_TYPES.SPECIFIC_PRODUCTS || targetVariantIds.length > 0) &&
        (targetType !== PROMOTION_TARGET_TYPES.CATEGORIES || targetCategoryIds.length > 0)
      : buyQuantity !== undefined &&
        getQuantity !== undefined &&
        getDiscountType !== undefined &&
        getDiscountValue !== undefined &&
        (buyTargetType !== PROMOTION_TARGET_TYPES.SPECIFIC_PRODUCTS || buyVariantIds.length > 0) &&
        (buyTargetType !== PROMOTION_TARGET_TYPES.CATEGORIES || buyCategoryIds.length > 0) &&
        (getTargetType !== PROMOTION_TARGET_TYPES.SPECIFIC_PRODUCTS || getVariantIds.length > 0) &&
        (getTargetType !== PROMOTION_TARGET_TYPES.CATEGORIES || getCategoryIds.length > 0));

  function handleSubmit() {
    const input: PromotionInput = {
      name: name.trim(),
      type,
      startAt,
      endAt,
      applyToAllLocations,
      locationIds: applyToAllLocations ? undefined : locationIds,
      ...(isDiscountType
        ? {
            targetType,
            targetVariantIds: targetType === PROMOTION_TARGET_TYPES.SPECIFIC_PRODUCTS ? targetVariantIds : undefined,
            targetCategoryIds: targetType === PROMOTION_TARGET_TYPES.CATEGORIES ? targetCategoryIds : undefined,
            discountType,
            discountValue,
          }
        : {
            buyQuantity,
            buyTargetType,
            buyVariantIds: buyTargetType === PROMOTION_TARGET_TYPES.SPECIFIC_PRODUCTS ? buyVariantIds : undefined,
            buyCategoryIds: buyTargetType === PROMOTION_TARGET_TYPES.CATEGORIES ? buyCategoryIds : undefined,
            getQuantity,
            getTargetType,
            getVariantIds: getTargetType === PROMOTION_TARGET_TYPES.SPECIFIC_PRODUCTS ? getVariantIds : undefined,
            getCategoryIds: getTargetType === PROMOTION_TARGET_TYPES.CATEGORIES ? getCategoryIds : undefined,
            getDiscountType,
            getDiscountValue,
          }),
    };
    saveMutation.mutate(input, { onSuccess: () => router.push('/promotions') });
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/promotions" aria-label={t('back')} className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100">
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </Link>
        <h1 className="text-lg font-semibold text-zinc-900">
          {promotion ? t('editPromotion') : t(`createTitles.${type}`)}
        </h1>
      </div>

      <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="space-y-1.5">
          <Label htmlFor="promotionName">{t('promotionName')}</Label>
          <Input id="promotionName" value={name} onChange={(event) => setName(event.target.value)} maxLength={150} />
        </div>

        <ScheduleFields startAt={startAt} onStartAtChange={setStartAt} endAt={endAt} onEndAtChange={setEndAt} />

        <LocationTargeting
          applyToAllLocations={applyToAllLocations}
          onApplyToAllLocationsChange={setApplyToAllLocations}
          locationIds={locationIds}
          onLocationIdsChange={setLocationIds}
        />
      </div>

      {isDiscountType ? (
        <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-zinc-900">{t('discountConfiguration')}</h2>
          <TargetPicker
            label={t('appliesTo')}
            targetType={targetType}
            onTargetTypeChange={setTargetType}
            variantIds={targetVariantIds}
            onVariantIdsChange={setTargetVariantIds}
            categoryIds={targetCategoryIds}
            onCategoryIdsChange={setTargetCategoryIds}
          />
          <DiscountFields
            label={t('discount')}
            discountType={discountType}
            onDiscountTypeChange={setDiscountType}
            discountValue={discountValue}
            onDiscountValueChange={setDiscountValue}
          />
        </div>
      ) : (
        <>
          <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-zinc-900">{t('buySection')}</h2>
            <div className="space-y-1.5">
              <Label htmlFor="buyQuantity">{t('buyQuantity')}</Label>
              <Input
                id="buyQuantity"
                type="number"
                min="1"
                value={buyQuantity ?? ''}
                onChange={(event) => setBuyQuantity(event.target.value === '' ? undefined : Number(event.target.value))}
                className="max-w-32"
              />
            </div>
            <TargetPicker
              label={t('ofProducts')}
              targetType={buyTargetType}
              onTargetTypeChange={setBuyTargetType}
              variantIds={buyVariantIds}
              onVariantIdsChange={setBuyVariantIds}
              categoryIds={buyCategoryIds}
              onCategoryIdsChange={setBuyCategoryIds}
            />
          </div>

          <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-zinc-900">{t('getSection')}</h2>
            <div className="space-y-1.5">
              <Label htmlFor="getQuantity">{t('getQuantity')}</Label>
              <Input
                id="getQuantity"
                type="number"
                min="1"
                value={getQuantity ?? ''}
                onChange={(event) => setGetQuantity(event.target.value === '' ? undefined : Number(event.target.value))}
                className="max-w-32"
              />
            </div>
            <TargetPicker
              label={t('ofProducts')}
              targetType={getTargetType}
              onTargetTypeChange={setGetTargetType}
              variantIds={getVariantIds}
              onVariantIdsChange={setGetVariantIds}
              categoryIds={getCategoryIds}
              onCategoryIdsChange={setGetCategoryIds}
            />
            <DiscountFields
              label={t('getDiscount')}
              discountType={getDiscountType}
              onDiscountTypeChange={setGetDiscountType}
              discountValue={getDiscountValue}
              onDiscountValueChange={setGetDiscountValue}
            />
          </div>
        </>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.push('/promotions')}>
          {tCommon('cancel')}
        </Button>
        <Button type="button" disabled={!canSave || saveMutation.isPending} onClick={handleSubmit}>
          {tCommon('save')}
        </Button>
      </div>
    </div>
  );
}
