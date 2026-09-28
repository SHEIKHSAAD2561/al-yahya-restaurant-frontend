'use client';

import { BookOpen, CheckCircle2, Landmark, ListTree, NotebookPen, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/core/i18n/navigation';
import { useSetupGuideQuery } from '../hooks/use-setup-guide-query';

export function SetupGuidePage() {
  const t = useTranslations('setupGuide');
  const setupGuideQuery = useSetupGuideQuery();

  if (setupGuideQuery.isPending || !setupGuideQuery.data) {
    return <Skeleton className="h-96 w-full" />;
  }

  const guide = setupGuideQuery.data;

  const cards = [
    {
      icon: ListTree,
      title: t('chartOfAccounts'),
      href: '/chart-of-accounts',
      lines: [t('accountsTotal', { count: guide.accounts.total }), t('accountsActive', { count: guide.accounts.active })],
    },
    {
      icon: NotebookPen,
      title: t('journalEntries'),
      href: '/journal-entries',
      lines: [
        t('entriesPosted', { count: guide.journalEntries.posted }),
        t('entriesDraft', { count: guide.journalEntries.draft }),
      ],
    },
    {
      icon: Landmark,
      title: t('fixedAssets'),
      href: '/fixed-assets',
      lines: [t('assetsTotal', { count: guide.fixedAssets.total }), t('assetsActive', { count: guide.fixedAssets.active })],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-5">
        <BookOpen className="mt-0.5 size-5 text-brand" />
        <div>
          <h1 className="text-base font-semibold text-zinc-900">{t('title')}</h1>
          <p className="mt-1 text-sm text-zinc-600">{t('intro')}</p>
        </div>
      </div>

      <div className={`flex items-center gap-2 rounded-2xl border p-4 ${guide.trialBalanceBalanced ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
        {guide.trialBalanceBalanced ? (
          <CheckCircle2 className="size-5 text-emerald-600" />
        ) : (
          <XCircle className="size-5 text-red-600" />
        )}
        <p className={`text-sm font-medium ${guide.trialBalanceBalanced ? 'text-emerald-700' : 'text-red-700'}`}>
          {guide.trialBalanceBalanced ? t('trialBalanceOk') : t('trialBalanceOff')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:border-brand/40 hover:bg-brand-muted/30"
          >
            <card.icon className="size-5 text-brand" />
            <h2 className="mt-3 text-sm font-semibold text-zinc-900">{card.title}</h2>
            <div className="mt-2 space-y-0.5 text-xs text-zinc-500">
              {card.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
