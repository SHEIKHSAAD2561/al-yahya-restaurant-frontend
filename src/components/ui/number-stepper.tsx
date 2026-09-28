'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NumberStepperProps {
  id?: string;
  value: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

/** Integer input with up/down buttons on the end side. Typed values are
 * clamped to [min, max] on blur rather than on every keystroke, so a user can
 * clear the field and type a new two-digit number. */
export function NumberStepper({
  id,
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  disabled,
  className,
}: NumberStepperProps) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  return (
    <div
      className={cn(
        'flex h-10 w-full max-w-60 overflow-hidden rounded-lg border border-zinc-300 bg-white',
        'focus-within:border-brand focus-within:ring-2 focus-within:ring-brand',
        disabled && 'cursor-not-allowed bg-zinc-50 opacity-50',
        className,
      )}
    >
      <input
        id={id}
        type="number"
        inputMode="numeric"
        value={Number.isNaN(value) ? '' : value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.valueAsNumber)}
        onBlur={() => onChange?.(clamp(Number.isNaN(value) ? min : value))}
        className="min-w-0 flex-1 bg-transparent px-3 text-sm text-zinc-900 outline-none disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <div
        className={cn(
          'flex w-10 flex-col',
          disabled ? 'bg-zinc-200 text-zinc-400' : 'bg-brand text-brand-foreground',
        )}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="+"
          disabled={disabled || value >= max}
          onClick={() => onChange?.(clamp(value + 1))}
          className="flex flex-1 items-center justify-center hover:bg-black/10 disabled:pointer-events-none"
        >
          <ChevronUp className="size-4" />
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-label="-"
          disabled={disabled || value <= min}
          onClick={() => onChange?.(clamp(value - 1))}
          className="flex flex-1 items-center justify-center hover:bg-black/10 disabled:pointer-events-none"
        >
          <ChevronDown className="size-4" />
        </button>
      </div>
    </div>
  );
}
