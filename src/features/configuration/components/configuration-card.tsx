import type { FormEventHandler, ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

interface ConfigurationCardProps {
  title: string;
  children: ReactNode;
  /** Omit for a read-only card (no Save button). */
  onSubmit?: FormEventHandler<HTMLFormElement>;
  canSave?: boolean;
}

/** One section of the Configuration page: a card with its own Save button
 * below it — every section saves independently. */
export function ConfigurationCard({ title, children, onSubmit, canSave }: ConfigurationCardProps) {
  const tCommon = useTranslations('common');

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-zinc-900">{title}</h2>
        {children}
      </div>
      {onSubmit && (
        <div className="flex justify-end">
          <Button type="submit" disabled={!canSave}>
            {tCommon('save')}
          </Button>
        </div>
      )}
    </form>
  );
}
