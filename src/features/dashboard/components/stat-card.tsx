import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  iconClassName?: string;
  value: string;
  label: string;
  trend: number | null;
}

export function StatCard({ icon: Icon, iconClassName, value, label, trend }: StatCardProps) {
  const t = useTranslations('dashboard');

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className={cn('flex size-9 items-center justify-center rounded-lg bg-brand-muted text-brand', iconClassName)}>
          <Icon className="size-4.5" />
        </span>
        {trend !== null && (
          <span
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
              trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700',
            )}
          >
            {trend >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {trend >= 0 ? '+' : ''}
            {trend}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-semibold text-zinc-900">{value}</p>
      <p className="mt-1 text-sm text-zinc-500">{label}</p>
      {trend !== null && <p className="mt-1 text-xs text-zinc-400">{t('vsLastMonth')}</p>}
    </div>
  );
}
