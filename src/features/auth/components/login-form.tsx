'use client';

import { Mail, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Link, useRouter } from '@/core/i18n/navigation';
import { useLoginMutation } from '../hooks/use-login-mutation';
import { loginSchema, type LoginInput } from '../schemas/login.schema';

export function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  function onSubmit(values: LoginInput) {
    loginMutation.mutate(values, {
      onSuccess: () => {
        router.push('/');
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message || t('genericError'));
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-zinc-900">{t('signIn')}</h1>
        <p className="text-sm text-zinc-500">{t('signInSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t('email')}</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className="ps-9"
              {...register('email')}
            />
          </div>
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t('password')}</Label>
            <Link href="/forgot-password" className="text-sm text-brand hover:underline">
              {t('forgotPassword')}
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute start-3 top-1/2 z-10 size-4 -translate-y-1/2 text-zinc-400" />
            <PasswordInput
              id="password"
              autoComplete="current-password"
              className="ps-9"
              {...register('password')}
            />
          </div>
          {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? t('signingIn') : t('signInButton')}
        </Button>
      </form>
    </div>
  );
}
