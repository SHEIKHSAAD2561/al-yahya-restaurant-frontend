'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/core/i18n/navigation';
import { authApi } from '../api/auth.api';

const WARNING_LEAD_SECONDS = 60;

type Status = 'idle' | 'refreshing' | 'expired';

/** Mounted once in the dashboard layout. `expiresAtSeconds` is the signed
 * session cookie's `exp` claim (seconds since epoch) as of the last full
 * page load — tracked as local state afterward so a successful "Stay signed
 * in" click reschedules the warning without needing the server layout to
 * re-render. */
export function SessionExpiryWatcher({ expiresAtSeconds }: { expiresAtSeconds: number }) {
  const t = useTranslations('auth');
  const router = useRouter();

  const [expiryMs, setExpiryMs] = useState(expiresAtSeconds * 1000);
  const [showWarning, setShowWarning] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [status, setStatus] = useState<Status>('idle');

  const signOutAndRedirect = useCallback(async () => {
    setStatus('expired');
    await authApi.logout().catch(() => undefined);
    setTimeout(() => {
      router.push('/login');
      router.refresh();
    }, 1200);
  }, [router]);

  // Schedule the warning to appear WARNING_LEAD_SECONDS before expiry.
  useEffect(() => {
    const msUntilWarning = expiryMs - Date.now() - WARNING_LEAD_SECONDS * 1000;
    const timer = setTimeout(() => setShowWarning(true), Math.max(msUntilWarning, 0));
    return () => clearTimeout(timer);
  }, [expiryMs]);

  // Tick the clock once the warning is visible — `secondsLeft` below is
  // derived from `now` during render, not stored as its own state. The
  // expiry check lives in this same interval callback (an async callback,
  // not the effect's synchronous setup body) so it can call setState.
  useEffect(() => {
    if (!showWarning) return;
    const interval = setInterval(() => {
      const currentNow = Date.now();
      setNow(currentNow);
      if (currentNow >= expiryMs) {
        clearInterval(interval);
        void signOutAndRedirect();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [showWarning, expiryMs, signOutAndRedirect]);

  const secondsLeft = Math.max(Math.round((expiryMs - now) / 1000), 0);

  async function handleStaySignedIn() {
    setStatus('refreshing');
    try {
      const result = await authApi.refreshSession();
      if (result.exp) setExpiryMs(result.exp * 1000);
      setShowWarning(false);
      setStatus('idle');
    } catch {
      void signOutAndRedirect();
    }
  }

  return (
    <Dialog open={showWarning}>
      <DialogContent
        hideCloseButton
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        {status === 'expired' ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <Loader2 className="size-6 animate-spin text-brand" />
            <p className="text-sm text-zinc-700">{t('sessionExpiredRedirecting')}</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t('sessionExpiringTitle')}</DialogTitle>
              <DialogDescription>
                {t('sessionExpiringDescription', { seconds: secondsLeft })}
              </DialogDescription>
            </DialogHeader>
            <Button
              className="w-full"
              onClick={handleStaySignedIn}
              disabled={status === 'refreshing'}
            >
              {status === 'refreshing' ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t('refreshingSession')}
                </>
              ) : (
                t('stayLoggedIn')
              )}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
