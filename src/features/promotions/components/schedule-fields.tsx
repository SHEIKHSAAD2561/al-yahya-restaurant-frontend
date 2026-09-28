'use client';

import { useTranslations } from 'next-intl';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ScheduleFieldsProps {
  startAt: string;
  onStartAtChange: (value: string) => void;
  endAt: string | null;
  onEndAtChange: (value: string | null) => void;
}

/** `<input type="datetime-local">` works in local wall-clock time (no
 * timezone suffix) — converting through `Date` and back keeps what's typed
 * and what's sent to the backend (an ISO string) in sync. */
function toLocalInputValue(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromLocalInputValue(value: string): string {
  return new Date(value).toISOString();
}

function addToNow(amount: number, unit: 'hours' | 'days' | 'weeks' | 'months'): string {
  const date = new Date();
  if (unit === 'hours') date.setHours(date.getHours() + amount);
  if (unit === 'days') date.setDate(date.getDate() + amount);
  if (unit === 'weeks') date.setDate(date.getDate() + amount * 7);
  if (unit === 'months') date.setMonth(date.getMonth() + amount);
  return date.toISOString();
}

/**
 * The reference screenshots showed quick-pick buttons alongside the start/end
 * date+time fields; the exact button set wasn't legible/available when this
 * was built, so this is a reasonable standard set (Now / +1 Day / +1 Week /
 * +1 Month) rather than a verbatim match — flagged here so it's easy to swap
 * for the real labels later.
 */
export function ScheduleFields({ startAt, onStartAtChange, endAt, onEndAtChange }: ScheduleFieldsProps) {
  const t = useTranslations('promotions');

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="startAt">{t('startDate')}</Label>
        <Input
          id="startAt"
          type="datetime-local"
          value={startAt ? toLocalInputValue(startAt) : ''}
          onChange={(event) => onStartAtChange(fromLocalInputValue(event.target.value))}
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onStartAtChange(new Date().toISOString())}
            className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600 hover:border-brand hover:text-brand"
          >
            {t('quickPick.now')}
          </button>
          <button
            type="button"
            onClick={() => onStartAtChange(addToNow(1, 'hours'))}
            className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600 hover:border-brand hover:text-brand"
          >
            {t('quickPick.inOneHour')}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="endAt">{t('endDate')}</Label>
        <label className="mb-1 flex items-center gap-2 text-sm text-zinc-600">
          <Checkbox checked={endAt === null} onCheckedChange={(checked) => onEndAtChange(checked ? null : addToNow(1, 'weeks'))} />
          {t('noEndDate')}
        </label>
        {endAt !== null && (
          <>
            <Input
              id="endAt"
              type="datetime-local"
              value={endAt ? toLocalInputValue(endAt) : ''}
              onChange={(event) => onEndAtChange(fromLocalInputValue(event.target.value))}
            />
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onEndAtChange(addToNow(1, 'days'))}
                className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600 hover:border-brand hover:text-brand"
              >
                {t('quickPick.plusOneDay')}
              </button>
              <button
                type="button"
                onClick={() => onEndAtChange(addToNow(1, 'weeks'))}
                className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600 hover:border-brand hover:text-brand"
              >
                {t('quickPick.plusOneWeek')}
              </button>
              <button
                type="button"
                onClick={() => onEndAtChange(addToNow(1, 'months'))}
                className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600 hover:border-brand hover:text-brand"
              >
                {t('quickPick.plusOneMonth')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
