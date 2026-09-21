'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Link } from '@/core/i18n/navigation';
import { useAcceptInvitationMutation } from '../hooks/use-accept-invitation-mutation';
import {
  createAcceptInvitationFormSchema,
  type AcceptInvitationFormInput,
} from '../schemas/accept-invitation.schema';

export function AcceptInvitationForm({ token }: { token: string }) {
  const t = useTranslations('auth');
  const [success, setSuccess] = useState(false);
  const acceptInvitationMutation = useAcceptInvitationMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInvitationFormInput>({
    resolver: zodResolver(createAcceptInvitationFormSchema(t('passwordsDontMatch'))),
    defaultValues: { token, password: '', confirmPassword: '' },
  });

  function onSubmit(values: AcceptInvitationFormInput) {
    acceptInvitationMutation.mutate(
      { token: values.token, password: values.password },
      {
        onSuccess: () => setSuccess(true),
        onError: (error) => toast.error(error.message || t('genericError')),
      },
    );
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold text-zinc-900">{t('acceptInvitationTitle')}</h1>
        </div>
        <div className="space-y-4 text-center">
          <p className="text-sm text-zinc-700">{t('acceptInvitationSuccess')}</p>
          <Button asChild size="lg" className="w-full">
            <Link href="/login">{t('backToSignIn')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-zinc-900">{t('acceptInvitationTitle')}</h1>
        <p className="text-sm text-zinc-500">{t('acceptInvitationSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <input type="hidden" {...register('token')} />
        <div className="space-y-1.5">
          <Label htmlFor="password">{t('newPassword')}</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute start-3 top-1/2 z-10 size-4 -translate-y-1/2 text-zinc-400" />
            <PasswordInput
              id="password"
              autoComplete="new-password"
              className="ps-9"
              {...register('password')}
            />
          </div>
          {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute start-3 top-1/2 z-10 size-4 -translate-y-1/2 text-zinc-400" />
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              className="ps-9"
              {...register('confirmPassword')}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={acceptInvitationMutation.isPending}
        >
          {t('acceptInvitationButton')}
        </Button>
      </form>
    </div>
  );
}
