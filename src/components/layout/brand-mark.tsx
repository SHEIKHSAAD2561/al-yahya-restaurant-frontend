import Image from 'next/image';
import { cn } from '@/lib/utils';

export function BrandMark({ className, logoUrl }: { className?: string; logoUrl?: string | null }) {
  if (logoUrl) {
    return (
      <div
        className={cn('relative size-9 shrink-0 overflow-hidden rounded-xl bg-white', className)}
        aria-hidden
      >
        <Image src={logoUrl} alt="" fill className="object-contain" unoptimized />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-foreground',
        className,
      )}
      aria-hidden
    >
      AY
    </div>
  );
}
