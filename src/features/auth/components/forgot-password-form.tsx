'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@/core/i18n/navigation';
import { useForgotPasswordMutation } from '../hooks/use-forgot-password-mutation';
import { forgotPasswordSchema, type ForgotPasswordInput } from '../schemas/forgot-password.schema';

export function ForgotPasswordForm() {
  const t = useTranslations('auth');
  const [sent, setSent] = useState(false);
  const forgotPasswordMutation = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  function onSubmit(values: ForgotPasswordInput) {
    forgotPasswordMutation.mutate(values, {
      onSuccess: () => setSent(true),
      onError: (error) => toast.error(error.message || t('genericError')),
    });
  }

  if (sent) {
    return (
      <div className="space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold text-zinc-900">{t('forgotPasswordTitle')}</h1>
        </div>
        <div className="space-y-4 text-center">
          <p className="text-sm text-zinc-700">{t('forgotPasswordSuccess')}</p>
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
        <h1 className="text-xl font-semibold text-zinc-900">{t('forgotPasswordTitle')}</h1>
        <p className="text-sm text-zinc-500">{t('forgotPasswordSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t('email')}</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input id="email" type="email" autoComplete="email" className="ps-9" {...register('email')} />
          </div>
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={forgotPasswordMutation.isPending}>
          {t('sendResetLink')}
        </Button>
        <Link href="/login" className="block text-center text-sm text-zinc-500 hover:text-zinc-800">
          {t('backToSignIn')}
        </Link>
      </form>
    </div>
  );
}
