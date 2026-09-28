'use client';

import { useTranslations } from 'next-intl';
import { Button } from './button';

/**
 * For a page whose queries settled into an error (or, just as importantly,
 * `isPending: false` with `data` still `undefined` — which happens whenever
 * a request fails outright, e.g. the backend restarting mid-request). A
 * loading guard that only checks `isPending` misses this case and lets a
 * `!` non-null assertion crash the page on the next line.
 */
export function QueryErrorState({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations('common');
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="text-sm text-zinc-500">{t('somethingWentWrong')}</p>
      <Button variant="outline" onClick={onRetry}>
        {t('retry')}
      </Button>
    </div>
  );
}
