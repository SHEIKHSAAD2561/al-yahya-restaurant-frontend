'use client';

interface HorizontalBarChartProps {
  bars: { label: string; value: number }[];
  formatValue?: (value: number) => string;
}

/** A plain flexbox-based horizontal bar chart — no SVG needed for this
 * shape, just relatively-widthed divs, matching the reference's "Sales by
 * payment method" / "Branch sales" bars. */
export function HorizontalBarChart({ bars, formatValue }: HorizontalBarChartProps) {
  const fmt = formatValue ?? ((value: number) => value.toFixed(2));
  const maxValue = Math.max(...bars.map((bar) => bar.value), 1);

  if (bars.length === 0) {
    return <div className="flex h-24 items-center justify-center text-sm text-zinc-400">No data</div>;
  }

  return (
    <div className="space-y-3">
      {bars.map((bar, index) => (
        <div key={index} className="grid grid-cols-[6rem_1fr] items-center gap-3 text-sm">
          <span className="truncate text-zinc-600">{bar.label}</span>
          <div className="group relative h-6 rounded bg-zinc-100">
            <div
              className="h-full rounded bg-brand transition-all"
              style={{ width: `${Math.max(2, (bar.value / maxValue) * 100)}%` }}
              title={`${bar.label}: ${fmt(bar.value)}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
