import type { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  title?: string;
  hint?: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** One white card of the product form. */
export function FormSection({ title, hint, description, action, children, className }: FormSectionProps) {
  return (
    <section className={cn('rounded-2xl border border-zinc-200 bg-white p-6', className)}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2 className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900">
                {title}
                {hint && (
                  <span title={hint} aria-label={hint} className="text-zinc-400">
                    <Info className="size-3.5" />
                  </span>
                )}
              </h2>
            )}
            {description && <p className="mt-1 text-xs text-zinc-500">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
