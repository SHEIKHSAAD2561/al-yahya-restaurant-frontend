'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { QueryErrorState } from '@/components/ui/query-error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, useRouter } from '@/core/i18n/navigation';
import { useRegisterQuery } from '../hooks/use-register-query';
import { useCloseRegisterMutation } from '../hooks/use-close-register-mutation';
import { CloseRegisterForm } from './close-register-form';

export function CloseRegisterPage({ registerId }: { registerId: string }) {
  const t = useTranslations('registers');
  const router = useRouter();
  const registerQuery = useRegisterQuery(registerId);
  const closeMutation = useCloseRegisterMutation();

  if (registerQuery.isPending) return <Skeleton className="h-96 w-full" />;
  if (registerQuery.isError || !registerQuery.data) {
    return <QueryErrorState onRetry={() => void registerQuery.refetch()} />;
  }
  const register = registerQuery.data;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/pos" aria-label={t('back')} className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100">
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </Link>
        <h1 className="text-lg font-semibold text-zinc-900">{t('closeRegisterTitle')}</h1>
      </div>
      <CloseRegisterForm
        registerName={register.name}
        paymentMethods={register.paymentMethods}
        isPending={closeMutation.isPending}
        onSubmit={(input) => closeMutation.mutate({ id: registerId, input }, { onSuccess: () => router.push('/pos') })}
      />
    </div>
  );
}
