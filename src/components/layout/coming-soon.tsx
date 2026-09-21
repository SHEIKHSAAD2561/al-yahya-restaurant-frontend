import { useTranslations } from 'next-intl';

export function ComingSoon({ title }: { title: string }) {
  const t = useTranslations('common');

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-white p-16 text-center">
      <h1 className="text-lg font-semibold text-zinc-900">{title}</h1>
      <p className="max-w-sm text-sm text-zinc-500">{t('comingSoonDescription')}</p>
    </div>
  );
}
