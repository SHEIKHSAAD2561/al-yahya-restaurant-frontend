import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { BrandMark } from '@/components/layout/brand-mark';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const tCommon = await getTranslations('common');
  const tAuth = await getTranslations('auth');

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-brand p-12 text-brand-foreground lg:flex">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 85% 15%, rgba(255,255,255,0.10), transparent 55%), radial-gradient(circle at 10% 90%, rgba(182,134,44,0.25), transparent 45%)',
          }}
        />
        <div className="relative flex items-center gap-3">
          <BrandMark />
          <span className="text-lg font-semibold">{tCommon('appName')}</span>
        </div>
        <div className="relative max-w-md space-y-4">
          <p className="text-3xl font-semibold leading-tight text-balance">{tAuth('heroTitle')}</p>
          <p className="text-brand-foreground/70">{tAuth('heroSubtitle')}</p>
        </div>
        <p className="relative text-sm text-brand-foreground/50">
          © {new Date().getFullYear()} {tCommon('appName')}
        </p>
      </div>

      <div className="relative flex flex-1 items-center justify-center bg-background px-4 py-12">
        <div className="absolute end-4 top-4">
          <LocaleSwitcher />
        </div>
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <BrandMark />
            <span className="text-lg font-semibold text-foreground">{tCommon('appName')}</span>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
