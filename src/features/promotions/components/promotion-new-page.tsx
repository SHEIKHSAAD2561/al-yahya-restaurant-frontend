'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n/navigation';
import { PromotionTypePicker } from './promotion-type-picker';
import { PromotionFormPage } from './promotion-form-page';
import type { PromotionType } from '../types/promotion';

export function PromotionNewPage() {
  const t = useTranslations('promotions');
  const [type, setType] = useState<PromotionType | null>(null);

  if (type) return <PromotionFormPage type={type} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/promotions" aria-label={t('back')} className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100">
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </Link>
        <h1 className="text-lg font-semibold text-zinc-900">{t('choosePromotionType')}</h1>
      </div>
      <PromotionTypePicker onChoose={setType} />
    </div>
  );
}
